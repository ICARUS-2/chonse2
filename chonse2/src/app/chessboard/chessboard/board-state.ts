import { computed, signal, WritableSignal } from "@angular/core";
import { Arrow } from "./arrow";
import LocalStorageHelper from "../../../libs/local-storage-helper";
import MoveClassificationList from "./move-classification-list";
import { PgnComments, PgnFields, PgnHeaders, SanMove } from "./pgn-misc";
import { Quote, Quotes } from "./quotes";
import { MoveClassification, EngineName } from "../../../libs/engine-lib/types/enums";
import { PositionEval, GameEval, EvaluateGameParams, EvalSource, LineEval, EvaluatePositionWithUpdateParams } from "../../../libs/engine-lib/types/eval";
import { UciEngine } from "../../../libs/engine-lib/uciEngine";
import MoveResult from "./move-result";
import { CoachUtils } from "../../../libs/coach-lib/coach-utils";
import { CoachMoveSequenceType } from "../../../libs/coach-lib/coach-types";
import { getMovesClassification } from "../../../libs/engine-lib/helpers/moveClassification";
import { AppInjector } from "../../app-injector";
import { CoachAudio } from "../../../libs/coach-lib/coach-audio";
import { ChessConstants } from "../../../libs/chess-game-lib/types/constants";
import { GameScore } from "../../../libs/chess-game-lib/types/game-state";
import { PieceColor } from "../../../libs/chess-game-lib/types/piece-color";
import { PieceType } from "../../../libs/chess-game-lib/types/piece-type";
import IChessGame from "../../../libs/chess-game-lib/i-chess-game";
import ChessGameFactory from "../../../libs/chess-game-lib/chess-game-factory";

export default class BoardState
{
    pgnHeaders: WritableSignal<PgnHeaders>;

    //For the moves actually being performed.
    mainStateStack: WritableSignal<Array<IChessGame>>;     
    mainStackPointer: WritableSignal<number>;
    mainMoveStack: WritableSignal<Array<MoveResult>>;
    
    //For going back and playing out what move COULD have been made.
    divergenceStateStack: WritableSignal<Array<IChessGame>>;
    divergenceMoveStack: WritableSignal<Array<MoveResult>>;
    divergenceEvalStack: WritableSignal<Array<PositionEval>>;

    //Eval stuff.
    doEvaluateGame: WritableSignal<boolean> = signal(false);
    eval: WritableSignal<GameEval | undefined> = signal(undefined);
    evalProgress: WritableSignal<number> = signal(0);
    engine: WritableSignal<UciEngine | undefined> = signal(undefined);
    whiteMoveClassificationList: WritableSignal<MoveClassificationList> = signal(new MoveClassificationList());
    blackMoveClassificationList: WritableSignal<MoveClassificationList> = signal(new MoveClassificationList());
    evaluationQueue: (() => Promise<void>)[] = [];
    isProcessingQueue: boolean = false;

    //Coach stuff
    coachButtonsDisabled: WritableSignal<boolean> = signal(false);
    isCoachMoveShowing: WritableSignal<boolean> = signal(false);
    isCoachMoveFinished: WritableSignal<boolean> = signal(false);
    isCoachIdeaShowing: WritableSignal<boolean> = signal(false);
    coachMoveSequenceType: WritableSignal<CoachMoveSequenceType> = signal(CoachMoveSequenceType.None);
    audioService = AppInjector.injector.get(CoachAudio);

    //Vs ai stuff
    isVsAi: WritableSignal<boolean> = signal(false);
    humanPlayerIsWhite: WritableSignal<boolean> = signal(true);
    aiElo: WritableSignal<number> = signal(UciEngine.MIN_ELO);
    playerDidResign: WritableSignal <boolean> = signal(false);

    //Cosmetic stuff.
    squareHighlightStatuses: WritableSignal<Array<Array<boolean>>>;
    arrows: WritableSignal<Array<Arrow>>;
    isFlipped: WritableSignal<boolean>;
    displayedQuote: WritableSignal<Quote | undefined> = signal(undefined);

    //Behavior
    //Read-only means the main stack cannot be modified (all new moves pushed to divergence stack).
    isReadOnly: WritableSignal<boolean> = signal(false);
    //Locked means no moves can take place.
    isLocked: WritableSignal<boolean> = signal(false);

    constructor(startingStates: Array<IChessGame> = [ChessGameFactory.create()], headers: PgnHeaders = new PgnHeaders())
    {
        this.pgnHeaders = signal(headers);

        this.squareHighlightStatuses = signal(BoardState.initializeHighlightStatuses());
        this.arrows = signal([]);
        this.isFlipped = signal(false);

        this.mainStateStack = signal([]);
        this.mainStateStack = signal([...startingStates]);
        this.mainStackPointer = signal(0);
        this.mainMoveStack = signal([]);

        this.divergenceStateStack = signal([]);
        this.divergenceMoveStack = signal([]);
        this.divergenceEvalStack = signal([]);
    }

    //#region STATES
    async pushState(state: IChessGame, move: MoveResult, isCoachMove: boolean = false)
    {
        const previousEval = this.getMostRecentEval();

        //If the pointer was moved back, diverge from the main path.
        if (this.mainStackPointer() != this.mainStateStack().length - 1 || this.isReadOnly() || isCoachMove)
        {
            let previousState: IChessGame;

            if (this.divergenceMoveStack().length != 0)
            {
                previousState = this.divergenceStateStack()[this.divergenceStateStack().length - 1];
            }
            else 
            {
               previousState = this.mainStateStack()[this.mainStackPointer()];
            }

            this.divergenceStateStack.update(stack => [...stack, state]);
            this.divergenceMoveStack.update(stack => [...stack, move]);


            if (this.engine() && this.doEvaluateGame())
            {
                this.performDivergenceEvaluation(previousState, state, move, previousEval, isCoachMove);
            }
        }
        else //If the pointer is at the top of the stack, continue to add to it.
        {
            this.mainStateStack.update( stack => [...stack, state] );
            this.mainMoveStack.update( stack => [...stack, move] );
            this.mainStackPointer.update( ptr => ptr + 1 );
        }
    }

    getCurrentState(): IChessGame
    {
        //If we are diverging from the main game, return what was pushed to the secondary stack.
        if (this.divergenceStateStack().length != 0)
        {
            return this.divergenceStateStack()[this.divergenceStateStack().length - 1];
        }

        //Otherwise, just get the current main state.
        return this.mainStateStack()[this.mainStackPointer()];    
    }
    //#endregion
    
    //#region MOVES
    getMostRecentMove(): MoveResult 
    {
        //If we have any moves in the divergence stack, return the most recent one
        if (this.divergenceStateStack().length > 0) 
        {
            return this.divergenceMoveStack()[this.divergenceMoveStack().length - 1];
        }

        //Otherwise, check the main move stack using the pointer
        if (this.mainStackPointer() > 0) 
        { 
            return this.mainMoveStack()[this.mainStackPointer() - 1];
        }

        //If neither stack has a move (aka starting position), return a dummy move.
        return new MoveResult();
    }

    getPreviousMostRecentState(): IChessGame
    {
        if (this.divergenceStateStack().length == 1)
        {
            return this.mainStateStack()[this.mainStackPointer()];
        }

        if (this.divergenceStateStack().length > 1)
        {
            return this.divergenceStateStack()[this.divergenceStateStack().length - 2];
        }
        
        return this.mainStateStack()[this.mainStackPointer() - 1];
    }

    getFutureMove(): MoveResult 
    {
        //Check the main move stack using the pointer
        if (this.mainStackPointer() < this.mainMoveStack().length) 
        {
            return this.mainMoveStack()[this.mainStackPointer()];
        }

        //If no moves ahead, return a dummy move
        return new MoveResult();
    }
    //#endregion

    //#region COACH
    //Function is necessary so that the coach display doesn't show the eval for its own follow-up move.
    getRootForFollowUp(): {move: MoveResult | undefined, eval: PositionEval | undefined}
    {
        let returnMove: MoveResult | undefined = undefined;
        let returnEval: PositionEval | undefined = undefined;

        //If we are diverging, comb backwards through the stack to find the first non-coach generated move (delimited by *)
        if (this.divergenceMoveStack().length > 0)
        {
            for(let i = this.divergenceMoveStack().length - 1; i >= 0; i--)
            {
                const move = this.divergenceMoveStack()[i];


                if (!move.isCoachMove)
                {
                    returnMove = move;
                    returnEval = this.divergenceEvalStack()[i];
                    break;
                }
            }
        }

        //If divergence stack contains no values, then we just need the stack at the pointer position.
        if (returnMove == undefined)
        {
            returnMove = this.mainMoveStack()[this.mainStackPointer() - 1];
            returnEval = this.eval()?.positions[this.mainStackPointer()];
        }

        return {move: returnMove, eval: returnEval}
    }


    disableCoachButtonsTemporarily(duration = 1500) 
    {
        this.coachButtonsDisabled.set(true);

        setTimeout(() => {
        this.coachButtonsDisabled.set(false);
        }, duration);
    }
    //#endregion

    //#region EVAL
    getMostRecentEval() : PositionEval | undefined
    {
        if (this.divergenceEvalStack().length > 0) 
        {
            return this.divergenceEvalStack()[this.divergenceEvalStack().length - 1];
        }

        //Otherwise, check the main move stack using the pointer
        if (this.mainStackPointer() >= 0) { 
            const ev = this.eval();
            if (ev)
            {
                return ev.positions[this.mainStackPointer()];
            }
        }

        return undefined
    }

    getPreviousMostRecentEval(): PositionEval | undefined
    {
        const ev = this.eval();
        if (this.divergenceEvalStack().length == 1)
        {
            if (ev)
            {
                return ev.positions[this.mainStackPointer()];
            }
        }

        if (this.divergenceEvalStack().length > 1) 
        {
            if (ev)
            {
                return this.divergenceEvalStack()[this.divergenceEvalStack().length - 2];
            }
        }

        //Otherwise, check the main move stack using the pointer
        if (this.mainStackPointer() > 0) { 
            if (ev)
            {
                return ev.positions[this.mainStackPointer() - 1];
            }
        }

        return undefined
    }

    private async processEvaluationQueue() 
    {
        //do nothing if the engine is still processing.
        if (this.isProcessingQueue || this.evaluationQueue.length === 0) 
        {
            return;
        }

        this.isProcessingQueue = true;

        while (this.evaluationQueue.length > 0) 
        {
            //get handle on the next task
            const nextEvalTask = this.evaluationQueue.shift();
            
            if (nextEvalTask) {
                try 
                {
                    await nextEvalTask(); 
                } catch (error) 
                {
                    //console.error("Stockfish evaluation encountered an error:", error);
                }
            }
        }

        //queue empty, release lock.
        this.isProcessingQueue = false;
    }
    
    //Override for coach evals simply tells it to evaluate it at a lower depth (so the eval bar has a value), and make it best move no matter what (since the coach will always play the best move anyway)
    private async performDivergenceEvaluation(previousState: IChessGame, state: IChessGame, move: MoveResult, previousEval: PositionEval | undefined, overrideForCoachEvals = false)
    {
        const eng = this.engine();

        if (eng != undefined)
        {
            //Creates a new eval object where the fields will be set.
            const newEval: PositionEval = { bestMove: "", moveClassification: MoveClassification.None, opening: "", lines: [ {pv: [""], cp: 0} as LineEval ], source: EvalSource.Local };
            
            //Register change detection.
            this.divergenceEvalStack.update( d => [...d, newEval] );

            //Define what will be used to evaluate the position.
            const params: EvaluatePositionWithUpdateParams = 
            {
                //current fen
                fen: state.getFEN(),

                //if overriding for coach move, go min depth. otherwise, saved depth.
                depth: overrideForCoachEvals ? UciEngine.MIN_DEPTH : LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.MIN_DEPTH),
                
                //default pv
                multiPv: eng.multiPv,

                //mid-evaluation, move classification can be updated before it gets to the real depth.
                setPartialEval: ( positionEval: PositionEval ) => 
                {
                    //Put the fields in the newobject while keeping its reference the same (accounting for multiple additions to the stack).
                    this.copyPosEvalFields(positionEval, newEval);

                    //Want to have it show the best thing to do so far.
                    const bestLineSoFar = newEval.lines[0];
                    if (bestLineSoFar)
                    {
                        const pv = bestLineSoFar.pv;

                        if (pv)
                        {
                            if (pv.length > 0)
                            {
                                newEval.bestMove = pv[0];
                            }
                        }
                    }

                    //trigger cd
                    this.divergenceEvalStack.update(stack => [...stack]);
                },

                //once eval is complete, get move classification and everything.
                setCompletedEval: ( positionEval: PositionEval ) => 
                {
                    const prevEval = this.getPreviousMostRecentEval();
                    if (prevEval)
                    {
                        //only once the full eval is done should we get the move classification for that move.
                        const classificationEval = getMovesClassification(
                            [prevEval, positionEval], //pos 
                            [move.getUci()], //move 
                            [previousState.getFEN(), state.getFEN()] //fens
                        )

                        //if it succeeds, copy its fields.
                        if (classificationEval[1])
                        {
                            //we are using a lower depth value for the coach evals since they are always the best move.
                            if (overrideForCoachEvals)
                            {
                                if (classificationEval[1].moveClassification != MoveClassification.Opening)
                                {
                                    classificationEval[1].moveClassification = MoveClassification.Best;
                                }
                            }
                            //copy fields first
                            this.copyPosEvalFields(classificationEval[1], newEval);
                            
                            if (previousEval && !overrideForCoachEvals)
                            {
                                CoachUtils.performCoachAnalysis([previousState, state], [move], [previousEval, newEval]);
                                this.audioService.playSentences(move.coachSentences);
                            }

                            //then trigger cd
                            this.divergenceEvalStack.update(stack => [...stack]);
                        }
                    }
                }
            }

            //wrap the thing in a task
            const evalTask = async () => 
            {
                await eng.evaluatePositionWithUpdate(params);
            };

            //stick it in da queue
            this.evaluationQueue.push(evalTask);

            //process da queue
            this.processEvaluationQueue();
        }
    }

    private copyPosEvalFields(fromPosEval: PositionEval, toPosEval: PositionEval)
    {
        toPosEval.bestMove = fromPosEval.bestMove;
        toPosEval.opening = fromPosEval.opening;
        toPosEval.lines = fromPosEval.lines;
        toPosEval.moveClassification = fromPosEval.moveClassification;
    }

    public isGameEvaluationInProgress = computed( () => 
    {
        const progress = this.evalProgress();
        return progress > 0 && progress < 97.1;
    } )

    //#endregion

    //#region STACK TRAVERSAL
    goBackToStart()
    {
        //Simply back up to the first move.
        this.mainStackPointer.set(0);
        this.divergenceStateStack.set([]);
        this.divergenceMoveStack.set([]);
        this.divergenceEvalStack.set([]);
    }

    goBack()
    {
        //If we aren't diverging from the main game, just move the pointer back by 1.
        if (this.divergenceStateStack().length == 0)
        {
            //Cannot go back if we are already at the first move.
            if (this.mainStackPointer() == 0)
            {
                return;
            }

            //If we are somewhere past the first move, go back one.
            this.mainStackPointer.update(ptr => ptr - 1);
        }
        else //If we are diverging, just get rid of the state entirely.
        {
            if (this.eval())
            {
                if (this.divergenceEvalStack().length >= this.divergenceMoveStack().length)
                {
                    this.divergenceEvalStack.update(stack => stack.slice(0, -1));
                }
            }

            this.divergenceStateStack.update(stack => stack.slice(0, -1));
            this.divergenceMoveStack.update(stack => stack.slice(0, -1));
        }
    }

    goForward()
    {
        //If we are deviating from the main game, don't go forward (can't see the future).
        if (this.divergenceStateStack().length != 0)
        {
            return;
        }

        //If the stack pointer isn't already at the end, then go up by one.
        if (this.mainStackPointer() != this.mainStateStack().length - 1)
        {
            this.mainStackPointer.update(ptr => ptr + 1);
        }
    }

    goForwardToEnd()
    {
        //If we are deviating from the main game, can't see into the future.
        if (this.divergenceStateStack().length != 0)
        {
            return;
        }

        //If we are already at the final move, don't do anything.
        if (this.mainStackPointer() == this.mainStateStack().length - 1)
        {
            return;
        }

        //If we are going through the main game and we aren't at the end, go to the very end.
        this.mainStackPointer.set(this.mainStateStack().length - 1);
    }
    //#endregion

    //#region Eval/PGN
    static parsePGN(pgn: string, setAnalyzeFlag: boolean = false): BoardState
    {
        //States and PGN headers to be returned.
        const { states, moveStack, pgnHeaders } = ChessGameFactory.createFromPgn(pgn);

        const boardState = new BoardState();
        boardState.pgnHeaders.set(pgnHeaders);
        boardState.mainMoveStack.set(moveStack);
        boardState.mainStateStack.set(states);
        boardState.isReadOnly.set(true);
        
        boardState.doEvaluateGame.set(setAnalyzeFlag);

        return boardState;
    }

    async evaluateGame(): Promise<void> 
    {
        //Don't evaluate it if the flag hasn't been set.
        if (!this.doEvaluateGame())
        {   
            return;
        }

        //Will initialize the engine based on user preference.
        await this.setEngineIfNotExists();

        //Sets up the ratings and progress setter.
        const params = this.getEvaluateGameParams();
        params.setEvaluationProgress = ( (value: number) => this.evalProgress.set(value));
        params.playersRatings = this.pgnHeaders().whiteElo && this.pgnHeaders().blackElo ? {white: Number(this.pgnHeaders().whiteElo), black: Number(this.pgnHeaders().blackElo)} : {}

        //Get the quote to be displayed
        this.displayedQuote.set(Quotes.getQuote());

        //Evaluate the game.
        const engine = this.engine();
        if (engine)
        {
            const evalResult = await engine.evaluateGame(params);

            this.eval.set(evalResult);
        }

        //Computes how many moves of each classification there are
        Object.values(MoveClassification).forEach( v => 
        {
            this.whiteMoveClassificationList.update(list => 
            {
                list.moves = new Map(list.moves); // copy map
                list.moves.set(v, { arr: [], ptr: 0 });
                return list;
            });

            this.blackMoveClassificationList.update(list => 
            {
                list.moves = new Map(list.moves);
                list.moves.set(v, { arr: [], ptr: 0 });
                return list;
            });
        })

        //Pushes the indeces of the moves to their correct arrays.
        let turn = !this.mainStateStack()[0].getTurn();

        this.eval()?.positions.forEach( (pos, idx) =>
        {
            const map = turn ? this.whiteMoveClassificationList().moves : this.blackMoveClassificationList().moves;

            const correspondingArray = map.get(pos.moveClassification ?? MoveClassification.None);
            correspondingArray?.arr.push(idx);

            turn = !turn;
        });

        const ev = this.eval();
        if (ev != undefined)
        {            
            CoachUtils.performCoachAnalysis(this.mainStateStack(), this.mainMoveStack(), ev.positions)
        }
    }

    async setEngineIfNotExists()
    {
        if (!this.engine())
        {
            //Gets the engine type saved as per the user setting.
            const engineType: EngineName = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, EngineName.Stockfish18Lite) as EngineName;
            
            const cloudHybridMode: boolean = LocalStorageHelper.getBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, true);

            //Instantiate the engine with the factory.
            const engine: UciEngine = await UciEngine.getEngine(engineType);
            engine.isCloudHybridMode = cloudHybridMode;
            
            //Handle on it so it can be used later.
            this.engine.set(engine);
        }
    }

    static initializeHighlightStatuses(): Array<Array<boolean>>
    {
        const highlightStatuses: Array<Array<boolean>> = [];

        for(let i = 0; i < ChessConstants.SIZE; i++)
        {
            const rank: Array<boolean> = [];
            for(let j = 0; j < ChessConstants.SIZE; j++)
            {
                rank[j] = false;
            }
            highlightStatuses.push(rank);
        }

        return highlightStatuses;
    }

    getEvaluateGameParams(): EvaluateGameParams
    {
        const fens: string[] = this.mainStateStack().map( c2 => c2.getFEN() );
        const uciMoves: string[] = this.mainMoveStack().map(m => m.getUci());
        const depth = LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.DEFAULT_DEPTH);
        const workersNb = LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_THREAD_COUNT, 1);

        return {fens, uciMoves, depth, workersNb};
    }

    exportPGN(): string
    {
        let str: string = "";

        //Required fields
        str += `[${PgnFields.Event} "${this.pgnHeaders().event}"]\n`;
        str += `[${PgnFields.Site} "${this.pgnHeaders().site}"]\n`;
        str += `[${PgnFields.Date} "${this.pgnHeaders().date}"]\n`;
        str += `[${PgnFields.Round} "${this.pgnHeaders().round}"]\n`;
        str += `[${PgnFields.White} "${this.pgnHeaders().white}"]\n`;
        str += `[${PgnFields.Black} "${this.pgnHeaders().black}"]\n`;
        str += `[${PgnFields.Result} "${this.pgnHeaders().result}"]\n`;

        //Optional fields (only if present)
        if (this.pgnHeaders().whiteElo)
            str += `[${PgnFields.WhiteElo} "${this.pgnHeaders().whiteElo}"]\n`;

        if (this.pgnHeaders().blackElo)
            str += `[${PgnFields.BlackElo} "${this.pgnHeaders().blackElo}"]\n`;

        if (this.pgnHeaders().eco)
            str += `[${PgnFields.ECO} "${this.pgnHeaders().eco}"]\n`;

        if (this.pgnHeaders().termination)
            str += `[${PgnFields.Termination} "${this.pgnHeaders().termination}"]\n`;

        if (this.pgnHeaders().timeControl)
            str += `[${PgnFields.TimeControl} "${this.pgnHeaders().timeControl}"]\n`;

        //Other custom fields
        this.pgnHeaders().otherFields.forEach((value, key) => {
            str += `[${key} "${value}"]\n`;
        });

        //Empty line after headers
        str += "\n";

        this.mainMoveStack().forEach((mv, idx) =>
        {
            // Add move number before White moves
            if (idx % 2 === 0)
            {
                const moveNumber = Math.floor(idx / 2) + 1;
                str += `${moveNumber}. `;
            }

            str += `${mv.notationMinimal} `;

            if (mv.pgnComment)
            {
                str += `{${mv.pgnComment}} `
            }

        });

        //Append result at end of the PGN.
        if (this.pgnHeaders().result)
        {
            str += this.pgnHeaders().result;
        }
        return str;
    }
    //#endregion
}