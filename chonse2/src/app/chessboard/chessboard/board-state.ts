import { computed, signal, WritableSignal } from "@angular/core";
import { Arrow } from "./arrow";
import LocalStorageHelper from "../../../libs/local-storage-helper";
import MoveClassificationList from "./move-classification-list";
import { PgnFields, PgnHeaders, SanMove } from "./pgn-misc";
import { Quote, Quotes } from "./quotes";
import Chonse2 from "../../../libs/chonse2-lib/chonse2";
import { GameScore } from "../../../libs/chonse2-lib/game-state";
import { PieceColor } from "../../../libs/chonse2-lib/piece-color";
import { PieceType } from "../../../libs/chonse2-lib/piece-type";
import { MoveClassification, EngineName } from "../../../libs/engine-lib/types/enums";
import { PositionEval, GameEval, EvaluateGameParams, EvalSource, LineEval, EvaluatePositionWithUpdateParams } from "../../../libs/engine-lib/types/eval";
import { UciEngine } from "../../../libs/engine-lib/uciEngine";
import MoveResult from "./move-result";
import { CoachUtils } from "../../../libs/coach-lib/coach-utils";
import { CoachMoveSequenceType } from "../../../libs/coach-lib/coach-types";
import { getMovesClassification } from "../../../libs/engine-lib/helpers/moveClassification";

export default class BoardState
{
    pgnHeaders: WritableSignal<PgnHeaders>;

    //For the moves actually being performed.
    mainStateStack: WritableSignal<Array<Chonse2>>;     
    mainStackPointer: WritableSignal<number>;
    mainMoveStack: WritableSignal<Array<MoveResult>>;
    
    //For going back and playing out what move COULD have been made.
    divergenceStateStack: WritableSignal<Array<Chonse2>>;
    divergenceMoveStack: WritableSignal<Array<MoveResult>>;
    divergenceEvalStack: WritableSignal<Array<PositionEval>>;

    //Eval stuff.
    doEvaluateGame: WritableSignal<boolean> = signal(false);
    eval: WritableSignal<GameEval | undefined> = signal(undefined);
    evalProgress: WritableSignal<number> = signal(0);
    engine: WritableSignal<UciEngine | undefined> = signal(undefined);
    whiteMoveClassificationList: WritableSignal<MoveClassificationList> = signal(new MoveClassificationList());
    blackMoveClassificationList: WritableSignal<MoveClassificationList> = signal(new MoveClassificationList());

    //Coach stuff
    coachButtonsDisabled: WritableSignal<boolean> = signal(false);
    isCoachMoveShowing: WritableSignal<boolean> = signal(false);
    isCoachMoveFinished: WritableSignal<boolean> = signal(false);
    isCoachIdeaShowing: WritableSignal<boolean> = signal(false);
    coachMoveSequenceType: WritableSignal<CoachMoveSequenceType> = signal(CoachMoveSequenceType.None)

    //Vs ai stuff
    isVsAi: WritableSignal<boolean> = signal(false);
    humanPlayerIsWhite: WritableSignal<boolean> = signal(true);
    aiElo: WritableSignal<number> = signal(UciEngine.MIN_ELO);

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

    constructor(startingStates: Array<Chonse2> = [new Chonse2()], headers: PgnHeaders = new PgnHeaders())
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
    async pushState(state: Chonse2, move: MoveResult, isCoachMove: boolean = false)
    {
        const previousEval = this.getMostRecentEval();

        //If the pointer was moved back, diverge from the main path.
        if (this.mainStackPointer() != this.mainStateStack().length - 1 || this.isReadOnly() || isCoachMove)
        {
            let previousState: Chonse2;

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

    getCurrentState(): Chonse2
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

    getPreviousMostRecentState(): Chonse2
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

                //Return the first non coach move
                if (move.coachComment != CoachUtils.COACH_MOVE_DELIMITER)
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
    
    //Override for coach evals simply tells it to evaluate it at a lower depth (so the eval bar has a value), and make it best move no matter what (since the coach will always play the best move anyway)
    private async performDivergenceEvaluation(previousState: Chonse2, state: Chonse2, move: MoveResult, previousEval: PositionEval | undefined, overrideForCoachEvals = false)
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
                            [move.notation], //move 
                            [previousState.getFEN(), state.getFEN()] //fens
                        )

                        //if it succeeds, copy its fields.
                        if (classificationEval[1])
                        {
                            //copy fields first
                            this.copyPosEvalFields(classificationEval[1], newEval);
                            
                            if (previousEval)
                            {
                                CoachUtils.performCoachAnalysis([previousState, state], [move], [previousEval, newEval]);
                            }

                            //then trigger cd
                            this.divergenceEvalStack.update(stack => [...stack]);
                        }
                    }
                }
            }

            //perform eval.
            eng.evaluatePositionWithUpdate(params)
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
        const states: Array<Chonse2> = [];
        const moveStack: Array<MoveResult> = [];
        const pgnHeaders = new PgnHeaders();
        const boardState = new BoardState();

        //A PGN is always divided by newlines.
        const lines = pgn.split("\n");

        //PGN has two components: Headers and moves. 
        let isHeaderMode = true;

        //Scan each line of the file.
        for (let line of lines)
        {
            //If it hits a newline, the parser knows to switch modes.
            if (isHeaderMode && (line == "" || !line.startsWith("[") && !line.endsWith("]")))
            {
                isHeaderMode = false;
            }

            //If it's in header mode, parse the headers.
            if (isHeaderMode)
            {
                //Sometimes PGN headers can have comments. Disregard them entirely.
                if (!line.startsWith("{"))
                {
                    const lineWithoutBrackets = line.slice(1, -1);

                    let divider = lineWithoutBrackets.indexOf(" ");

                    const key = lineWithoutBrackets.slice(0, divider);
                    const value = lineWithoutBrackets.slice(divider + 1);

                    //Remove surrounding quotes if present
                    const cleanedValue = value.startsWith("\"") && value.endsWith("\"") ? value.slice(1, -1): value;

                    switch (key)
                    {
                        case PgnFields.Event:
                            pgnHeaders.event = cleanedValue;
                            break;

                        case PgnFields.Site:
                            pgnHeaders.site = cleanedValue;
                            break;

                        case PgnFields.Date:
                            pgnHeaders.date = cleanedValue;
                            break;

                        case PgnFields.Round:
                            pgnHeaders.round = cleanedValue;
                            break;

                        case PgnFields.White:
                            pgnHeaders.white = cleanedValue;
                            break;

                        case PgnFields.Black:
                            pgnHeaders.black = cleanedValue;
                            break;

                        case PgnFields.Result:
                            pgnHeaders.result = cleanedValue;
                            break;

                        case PgnFields.WhiteElo:
                            pgnHeaders.whiteElo = cleanedValue;
                            break;

                        case PgnFields.BlackElo:
                            pgnHeaders.blackElo = cleanedValue;
                            break;

                        case PgnFields.ECO:
                            pgnHeaders.eco = cleanedValue;
                            break;

                        case PgnFields.Termination:
                            pgnHeaders.termination = cleanedValue;
                            break;

                        case PgnFields.TimeControl:
                            pgnHeaders.timeControl = cleanedValue;
                            break;

                        default:
                            pgnHeaders.otherFields.set(key, cleanedValue);
                            break;
                    }
                }
            }
            else //If not, convert the moves.
            {
                //Accounts for the blank line
                if (line != "")
                {
                    //If we are currently parsing a comment or not.
                    let commentState: boolean = false;
                    let commentStr: string = "";

                    const tokens = line.split(" ");

                    for (let token of tokens)
                    {
                        //Check end of comment.
                        if (commentState)
                        {
                            if (token.includes("}"))
                            {
                                commentStr += token;
                                commentStr = commentStr.replace(/[()\[\]{}<>]/g, '')
                                commentState = false;
                            }
                            continue;
                        }

                        //Check start of comment.
                        if (token.startsWith("{"))
                        {
                            if(!token.includes("}"))
                            {
                                commentState = true;
                                commentStr += token;
                                continue;
                            }
                        }

                        //If it's a result, then that's it that's all
                        if (token == GameScore.WHITE_WON || token == GameScore.BLACK_WON || token == GameScore.DRAW || token == GameScore.IN_PROGRESS )
                        {
                            break;
                        }

                        //If it's a number, handle accordingly
                        //Handles just the number with however many dots.
                        if (/^\d+\.(\.\.)?$/.test(token))
                        {
                            continue;
                        }
                        //If it's a number + dot + move, remove the number from it and just keep the token.
                        if (/^\d+\..+/.test(token)) 
                        {
                            token = token.replace(/^\d+\.+/, "");
                        }

                        //Ignore NAGs
                        if (token.startsWith("$") || /^[!?]+$/.test(token))
                        {
                            continue;
                        }

                        //If we got this far, start parsing the moves.
                        if (states.length == 0)
                        {
                            states.push(new Chonse2());
                        }

                        //Copy the state and get whose turn it is.
                        const copyOfState: Chonse2 = states[states.length - 1].getFullDeepCopy();
                        const turn = copyOfState.turn;
                        const colorToMove = turn ? PieceColor.WHITE : PieceColor.BLACK;
        
                        let moveResult = new MoveResult();

                        //Special case: Kingside castle.
                        if (token == "O-O" || token == "O-O+" || token == "O-O#")
                        {
                            //From and to when castling kingside.
                            const kingSquare = turn ? Chonse2.WHITE_KING_SQUARE : Chonse2.BLACK_KING_SQUARE;
                            const toSquare = turn ? Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE : Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE;

                            //Perform the move on the deep copy.
                            moveResult = MoveResult.createMoveResultFromInterface(copyOfState.completeMove(kingSquare, toSquare));      
                            
                            //Register the move on the board's stacks.
                            states.push(copyOfState);
                            moveStack.push(moveResult);

                            //Do not continue past here if the move is already done.
                            continue;
                        }

                        //Special case: Queenside castle.
                        if (token == "O-O-O" || token == "O-O-O+" || token == "O-O-O#")
                        {
                            //From and to when castling queenside.
                            const kingSquare = turn ? Chonse2.WHITE_KING_SQUARE : Chonse2.BLACK_KING_SQUARE;
                            const toSquare = turn ? Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE : Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE;

                            //Perform the move on the deep copy.
                            moveResult = MoveResult.createMoveResultFromInterface(copyOfState.completeMove(kingSquare, toSquare));

                            //Register the move on the board's stacks.
                            states.push(copyOfState);
                            moveStack.push(moveResult);

                            //Do not continue past here if the move is already done.
                            continue;
                        }

                        //Remove check/mate notation as they don't serve any purpose in finding the squares.
                        token = token.replace(/[+#?!]+$/g, "");              
                        
                        //Parse the san into its parts.
                        const sanRegex = /^(?:([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(?:=([QRBN]))?)$/;
                        const match = token.match(sanRegex);
                        if (!match) throw new Error(`Invalid SAN: ${token}`);

                        const 
                        [
                            _,
                            piece,
                            fromFile,
                            fromRank,
                            capture,
                            to,
                            promotion
                        ] = match;

                        const move: SanMove = {
                            piece: piece ?? PieceType.PAWN,
                            toCoordinate: to,
                            fromFile: fromFile ?? null,
                            fromRank: fromRank ?? null,
                            isCapture: !!capture,
                            promotion: promotion ?? null
                        };

                        const pieceThatWillMove = colorToMove + move.piece;
                        const candidateFromCoordinates: Array<string> = [];
                        //Loop through the ranks.
                        for (let rank = 0; rank < copyOfState.pieceState.length; rank++)
                        {
                            //Get the current rank.
                            const currentRank = copyOfState.pieceState[rank];

                            //Loop through this current rank.
                            for(let file = 0; file < currentRank.length; file++)
                            {
                                //Get the current square by the file on the rank.
                                const currentSquareContent = currentRank[file];

                                //The piece in that square is either empty or not the piece we are looking for. Disregard it.
                                if (currentSquareContent != pieceThatWillMove)
                                {
                                    continue;
                                }

                                //File is known but is not the right file we are looking for. Disregard it.
                                if (move.fromFile != null)
                                {
                                    const fileChar = String.fromCharCode("a".charCodeAt(0) + file);
                                    if (fileChar != move.fromFile)
                                    {
                                        continue;
                                    }
                                }

                                //Rank is known but is not the right file we are looking for. Disregard it.
                                if (move.fromRank != null)
                                {
                                    const rankChar = (Chonse2.SIZE - rank).toString();

                                    if (rankChar != move.fromRank)
                                    {
                                        continue
                                    }
                                }

                                //If we got this far, it might be the right square.
                                candidateFromCoordinates.push(Chonse2.COORDS[rank][file])
                            } 
                        }

                        //We will check what candidates have the toSquare as their legal move (it should be 1).
                        const passingCandidates: string[] = [];
                        for(let i = 0; i < candidateFromCoordinates.length; i++)
                        {
                            const currentCandidate: string = candidateFromCoordinates[i]; 
                            const legalMoves = copyOfState.getLegalMoves(currentCandidate);
                            
                            if (legalMoves.includes(move.toCoordinate))
                            {
                                passingCandidates.push(currentCandidate);
                            }
                        }

                        if (passingCandidates.length > 1)
                        {
                            throw("Illegal move");
                        }

                        //If we got this far, it's a valid move, push it.
                        moveResult = MoveResult.createMoveResultFromInterface(copyOfState.completeMove(passingCandidates[0], move.toCoordinate, move.promotion ?? undefined));
                        moveResult.pgnComment = commentStr;
                        commentStr = "";

                        states.push(copyOfState);
                        moveStack.push(moveResult);
                    }
                }
            }
        }

        if (states.length == 0)
        {
            throw("PGN parse invalid");
        }

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
        let turn = !this.mainStateStack()[0].turn;

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

        for(let i = 0; i < Chonse2.SIZE; i++)
        {
            const rank: Array<boolean> = [];
            for(let j = 0; j < Chonse2.SIZE; j++)
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
        const uciMoves: string[] = this.mainMoveStack().map(m => m.notation);
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

            str += `${mv.notation} `;

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