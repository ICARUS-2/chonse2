import { EngineName } from "./types/enums";
import {
  EvalSource,
  EvaluateGameParams,
  EvaluatePositionWithUpdateParams,
  GameEval,
  PositionEval,
} from "./types/eval";
import {
  getResultProperty,
  parseEvaluationResults,
} from "./helpers/parseResults";
import { computeAccuracy } from "./helpers/accuracy";
import { getIsStalemate, getWhoIsCheckmated } from './helpers/chessHelper';
import { getMovesClassification } from "./helpers/moveClassification";
import { computeEstimatedElo } from "./helpers/estimateElo";
import { EngineWorker, WorkerJob } from "./types/engine";
import { getEngineWorker, sendCommandsToWorker } from "./worker";
import { Stockfish11 } from "./engines/stockfish11";
import { Stockfish18 } from "./engines/stockfish18";
import { LichessAPI } from "../server-api-lib/lichess-api";
import MoveResult from "../../app/chessboard/chessboard/move-result";
import { isWasmSupported } from "./helpers/shared";


export class UciEngine {
  static getEngine(engineName: EngineName)
  {
    if (!isWasmSupported())
    {
      return Stockfish11.create();
    }

    switch (engineName) 
    {
      case EngineName.Stockfish18:
        return Stockfish18.create(false);
      case EngineName.Stockfish18Lite:
        return Stockfish18.create(true);
      case EngineName.Stockfish11:
        return Stockfish11.create();
    }
  }

  static readonly DEFAULT_ENGINE: EngineName.Stockfish18Lite;
  static readonly MIN_ELO: number = 1320;
  static readonly MAX_ELO: number = 3190;

  static readonly DEFAULT_DEPTH = 16;
  static readonly MIN_DEPTH = 12;
  public readonly name: EngineName;
  private workers: EngineWorker[] = [];
  private workerQueue: WorkerJob[] = [];
  private isReady = false;
  private enginePath: string;
  private customEngineInit?:
    | ((worker: EngineWorker) => Promise<void>)
    | undefined = undefined;
  private elo: number | undefined = undefined;
  public multiPv = 3;

  //Lichess cloud eval
  private lastCloudEvalRequest = 0;
  public isCloudHybridMode = false;

  private constructor(
    engineName: EngineName,
    enginePath: string,
    customEngineInit: UciEngine["customEngineInit"]
  ) {
    this.name = engineName;
    this.enginePath = enginePath;
    this.customEngineInit = customEngineInit;
  }

  public static async create(
    engineName: EngineName,
    enginePath: string,
    customEngineInit?: UciEngine["customEngineInit"]
  ): Promise<UciEngine> {
    const engine = new UciEngine(engineName, enginePath, customEngineInit);

    await engine.addNewWorker();
    engine.isReady = true;

    return engine;
  }

  private acquireWorker(): EngineWorker | undefined {
    for (const worker of this.workers) {
      if (!worker.isReady) continue;

      worker.isReady = false;
      return worker;
    }

    return undefined;
  }

  private async releaseWorker(worker: EngineWorker) {
    const nextJob = this.workerQueue.shift();
    if (!nextJob) {
      worker.isReady = true;
      return;
    }

    const res = await sendCommandsToWorker(
      worker,
      nextJob.commands,
      nextJob.finalMessage,
      nextJob.onNewMessage
    );

    this.releaseWorker(worker);
    nextJob.resolve(res);
  }

  private async setMultiPv(multiPv: number) {
    if (multiPv === this.multiPv) return;

    if (multiPv < 2 || multiPv > 6) {
      throw new Error(`Invalid MultiPV value : ${multiPv}`);
    }

    await this.sendCommandsToEachWorker(
      [`setoption name MultiPV value ${multiPv}`, "isready"],
      "readyok"
    );

    this.multiPv = multiPv;
  }

  private async setElo(elo: number) {
    if (elo === this.elo) return;

    if (elo < UciEngine.MIN_ELO || elo > UciEngine.MAX_ELO) {
      throw new Error(`Invalid Elo value : ${elo}`);
    }

    await this.sendCommandsToEachWorker(
      ["setoption name UCI_LimitStrength value true", "isready"],
      "readyok"
    );

    await this.sendCommandsToEachWorker(
      [`setoption name UCI_Elo value ${elo}`, "isready"],
      "readyok"
    );

    this.elo = elo;
  }

  public getIsReady(): boolean {
    return this.isReady;
  }

  private throwErrorIfNotReady() {
    if (!this.isReady) {
      throw new Error(`${this.name} is not ready`);
    }
  }

  public shutdown(): void {
    this.isReady = false;
    this.workerQueue = [];

    for (const worker of this.workers) {
      this.terminateWorker(worker);
    }
    this.workers = [];
  }

  private terminateWorker(worker: EngineWorker) {
    console.log(`Terminating worker from ${this.enginePath}`);
    worker.isReady = false;
    worker.uci("quit");
    worker.terminate();
  }

  public async stopAllCurrentJobs(): Promise<void> {
    this.workerQueue = [];
    await this.sendCommandsToEachWorker(["stop", "isready"], "readyok");

    for (const worker of this.workers) {
      this.releaseWorker(worker);
    }
  }

  private async sendCommands(
    commands: string[],
    finalMessage: string,
    onNewMessage?: (messages: string[]) => void
  ): Promise<string[]> {
    const worker = this.acquireWorker();

    if (!worker) {
      return new Promise((resolve) => {
        this.workerQueue.push({
          commands,
          finalMessage,
          onNewMessage,
          resolve,
        });
      });
    }

    const res = await sendCommandsToWorker(
      worker,
      commands,
      finalMessage,
      onNewMessage
    );

    this.releaseWorker(worker);
    return res;
  }

  private async sendCommandsToEachWorker(
    commands: string[],
    finalMessage: string,
    onNewMessage?: (messages: string[]) => void
  ): Promise<void> {
    await Promise.all(
      this.workers.map(async (worker) => {
        await sendCommandsToWorker(
          worker,
          commands,
          finalMessage,
          onNewMessage
        );
        this.releaseWorker(worker);
      })
    );
  }

  private async addNewWorker() {
    const worker = getEngineWorker(this.enginePath);

    await sendCommandsToWorker(worker, ["uci"], "uciok");
    await sendCommandsToWorker(
      worker,
      [`setoption name MultiPV value ${this.multiPv}`, "isready"],
      "readyok"
    );
    await this.customEngineInit?.(worker);
    await sendCommandsToWorker(worker, ["ucinewgame", "isready"], "readyok");

    this.workers.push(worker);
    this.releaseWorker(worker);
  }

  private async setWorkersNb(workersNb: number) {
    if (workersNb === this.workers.length) return;

    if (workersNb < 1) {
      throw new Error(
        `Number of workers must be greater than 0, got ${workersNb} instead`
      );
    }

    if (workersNb < this.workers.length) {
      const workersToRemove = this.workers.slice(workersNb);
      this.workers = this.workers.slice(0, workersNb);

      for (const worker of workersToRemove) {
        this.terminateWorker(worker);
      }
      return;
    }

    const workersNbToCreate = workersNb - this.workers.length;

    await Promise.all(
      new Array(workersNbToCreate).fill(0).map(() => this.addNewWorker())
    );
  }

  public async evaluateMove(beforeFen: string, afterFen: string, move: MoveResult, depth=UciEngine.DEFAULT_DEPTH): Promise<PositionEval>
  {
    //const workersNb = LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_THREAD_COUNT, 1);

    const evalResult = await this.evaluateGame({fens: [beforeFen, afterFen], uciMoves: [move.notation], depth});

    const positionResult = evalResult.positions[1];
    
    return positionResult;
  }

  public async evaluateGame({
    fens,
    uciMoves,
    depth = UciEngine.DEFAULT_DEPTH,
    multiPv = this.multiPv,
    setEvaluationProgress,
    playersRatings,
    workersNb = 1,
  }: EvaluateGameParams): Promise<GameEval> {
    this.throwErrorIfNotReady();
    this.isReady = false;
    setEvaluationProgress?.(1);

    await this.setMultiPv(multiPv);
    await this.sendCommandsToEachWorker(["ucinewgame", "isready"], "readyok");
    this.setWorkersNb(workersNb);

    const positions: PositionEval[] = new Array(fens.length);
    let completed = 0;

    const updateEval = (index: number, positionEval: PositionEval) => {
      completed++;
      positions[index] = positionEval;
      const progress = completed / fens.length;
      setEvaluationProgress?.(99 - Math.exp(-4 * progress) * 99);
    };

    if (this.isCloudHybridMode)
    {
      for (let i = 0; i < fens.length; i++) {
        const fen = fens[i];

        const whoIsCheckmated = getWhoIsCheckmated(fen);
        if (whoIsCheckmated) {
          updateEval(i, {
            lines: [
              {
                pv: [],
                depth: 0,
                multiPv: 1,
                mate: whoIsCheckmated === "w" ? -1 : 1,
              },
            ],
            source: EvalSource.Local
          });
          continue;
        }

        const isStalemate = getIsStalemate(fen);
        if (isStalemate) {
          updateEval(i, {
            lines: [
              {
                pv: [],
                depth: 0,
                multiPv: 1,
                cp: 0,
              },
            ],
            source: EvalSource.Local
          });
          continue;
        }

      //Evaluate either via cloud or local engine
      const result = await this.evaluatePosition(fen, depth);
      updateEval(i, result);
      }
    }

    else 
    {
      await Promise.all(
        fens.map(async (fen, i) => {
          const whoIsCheckmated = getWhoIsCheckmated(fen);
          if (whoIsCheckmated) {
            updateEval(i, {
              lines: [
                {
                  pv: [],
                  depth: 0,
                  multiPv: 1,
                  mate: whoIsCheckmated === "w" ? -1 : 1,
                },
              ],
            });
            return;
          }

          const isStalemate = getIsStalemate(fen);
          if (isStalemate) {
            updateEval(i, {
              lines: [
                {
                  pv: [],
                  depth: 0,
                  multiPv: 1,
                  cp: 0,
                },
              ],
            });
            return;
          }

          const result = await this.evaluatePosition(fen, depth);
          updateEval(i, result);
        })
      );
    }

    await this.setWorkersNb(1);
    this.isReady = true;

    const positionsWithClassification = getMovesClassification(
      positions,
      uciMoves,
      fens
    );
    const accuracy = computeAccuracy(positions);
    const estimatedElo = computeEstimatedElo(
      positions,
      playersRatings?.white,
      playersRatings?.black
    );

    return {
      positions: positionsWithClassification,
      estimatedElo,
      accuracy,
      settings: {
        engine: this.name,
        date: new Date().toISOString(),
        depth,
        multiPv,
      },
    };
  }

  private async evaluatePosition(
    fen: string,
    depth = UciEngine.DEFAULT_DEPTH,
    //workersNb: number
  ): Promise<PositionEval> {

    if (this.isCloudHybridMode)
    {
      const now = Date.now();

      if (now - this.lastCloudEvalRequest > 1000)
      {
        this.lastCloudEvalRequest = now;

        const cloudResult = await LichessAPI.getCloudEval(fen);

        if (cloudResult)
        {
          return cloudResult;
        }
      }
    }

    const results = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove"
    );

    return parseEvaluationResults(results, fen);
  }

  public async evaluatePositionWithUpdate({
    fen,
    depth = UciEngine.DEFAULT_DEPTH,
    multiPv = this.multiPv,
    setPartialEval,
    setCompletedEval,
  }: EvaluatePositionWithUpdateParams): Promise<PositionEval> {
    this.throwErrorIfNotReady();

    await this.stopAllCurrentJobs();
    await this.setMultiPv(multiPv);

    const onNewMessage = (messages: string[]) => {
      if (!setPartialEval) return;
      const parsedResults = parseEvaluationResults(messages, fen);
      setPartialEval(parsedResults);
    };

    console.log(`Evaluating position: ${fen}`);

    const results = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove",
      onNewMessage
    );

    const completeEval = parseEvaluationResults(results, fen);
    
    if (setCompletedEval)
    {
      setCompletedEval(completeEval);
    }

    return completeEval;
  }

  public async getEngineNextMove(
    fen: string,
    elo: number,
    depth = UciEngine.DEFAULT_DEPTH
  ): Promise<string | undefined> {
    this.throwErrorIfNotReady();

    await this.stopAllCurrentJobs();
    await this.setElo(elo);

    console.log(`Evaluating position: ${fen}`);

    const results = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove"
    );

    const moveResult = results.find((result) => result.startsWith("bestmove"));
    const move = getResultProperty(moveResult ?? "", "bestmove");
    if (!move) {
      throw new Error("No move found");
    }

    return move === "(none)" ? undefined : move;
  }
}
