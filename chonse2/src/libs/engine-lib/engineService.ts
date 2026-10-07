import { computed, Service, signal } from "@angular/core";
import LocalStorageHelper from "../local-storage-helper";
import { EngineName } from "./types/enums";
import { UciEngine } from "./uciEngine";
import { EvaluateGameParams, EvaluatePositionWithUpdateParams, GameEval, PositionEval } from "./types/eval";

@Service()
export class EngineService
{
    private readonly _engine = signal<UciEngine | null>(null);
    private _enginePromise: Promise<UciEngine> | null = null;

    public readonly name = computed(() => this._engine()?.name() ?? EngineName.None);
    public readonly isReady = computed(() => this._engine()?.isReady() ?? false);
    public readonly isCloudHybrid = computed(() => this._engine()?.isCloudHybridMode() ?? false);
    
    private readonly _isEvaluatingGame = signal(false);
    public readonly isEvaluatingGame = this._isEvaluatingGame.asReadonly();

    private async _getEngine(): Promise<UciEngine>
    {
        const existing = this._engine();
        if (existing !== null) return existing;

        if (this._enginePromise !== null) return this._enginePromise;

        const engineType = LocalStorageHelper.getString(
            LocalStorageHelper.SELECTED_ENGINE,
            EngineName.Stockfish18Lite
        ) as EngineName;

        const cloudHybridMode = LocalStorageHelper.getBoolean(
            LocalStorageHelper.CLOUD_HYBRID_MODE,
            true
        );

        this._enginePromise = UciEngine.getEngine(engineType)
            .then(engine =>
            {
                engine.setCloudHybridMode(cloudHybridMode);
                this._engine.set(engine); // set last, so computeds see a fully configured engine
                return engine;
            })
            .catch(error =>
            {
                this._enginePromise = null;
                throw error;
            });

        return this._enginePromise;
    }

    public setCloudHybrid(enabled: boolean): void
    {
        this._engine()?.setCloudHybridMode(enabled);
        LocalStorageHelper.setBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, enabled);
    }

    //#region Exposing functions without exposing instance.
    public async evaluateGame(params: EvaluateGameParams): Promise<GameEval> 
    {
        if (this.isEvaluatingGame())
        {
            throw {"message": "Cannot evaluate multiple games at the same time"}
        }

        const engine = await this._getEngine();

        this._isEvaluatingGame.set(true);
        const res = await engine.evaluateGame(params);
        this._isEvaluatingGame.set(false);

        return res;
    }

    public async evaluatePositionWithUpdate(params: EvaluatePositionWithUpdateParams): Promise<PositionEval> 
    {
        const engine = await this._getEngine();

        return engine.evaluatePositionWithUpdate(params);
    }

    public async getEngineNextMove(fen: string, elo: number, depth?: number): Promise<string | undefined> 
    {
        const engine = await this._getEngine();

        return engine.getEngineNextMove(fen, elo, depth);
    }

    public async getNumberOfLines()
    {
        const engine = await this._getEngine();

        return engine.multiPv;
    }


    public terminateEngine(): void 
    {
        this._engine()?.shutdown();
        this._engine.set(null);
        this._enginePromise = null;
    }
}