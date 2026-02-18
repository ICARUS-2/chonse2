import Chonse2 from "../../../lib/chonse2";
import { GameScore } from "../../../lib/game-state";
import { PieceColor } from "../../../lib/piece-color";
import { PieceType } from "../../../lib/piece-type";
import { EngineName, MoveClassification } from "../engine/types/enums";
import { EvaluateGameParams, GameEval, PositionEval } from "../engine/types/eval";
import { UciEngine } from "../engine/uciEngine";
import { Arrow } from "./arrow";
import LocalStorageHelper from "./local-storage-helper";
import MoveClassificationList from "./move-classification-list";
import { PgnFields, PgnHeaders, SanMove } from "./pgn-misc";

export default class BoardState
{
    pgnHeaders: PgnHeaders;

    //For the moves actually being performed.
    mainStateStack: Array<Chonse2>;    
    mainStackPointer: number;
    mainMoveStack: Array<IMoveResult>;
    
    //For going back and playing out what move COULD have been made.
    divergenceStateStack: Array<Chonse2>;
    divergenceStackPointer: number;
    divergenceMoveStack: Array<IMoveResult>
    divergenceEvalStack: Array<PositionEval>

    //Eval stuff.
    doEvaluateGame: boolean = false;
    eval: GameEval | undefined = undefined;
    evalProgress: number = 0;
    engine: UciEngine | undefined = undefined;
    whiteMoveClassificationList: MoveClassificationList = new MoveClassificationList();
    blackMoveClassificationList: MoveClassificationList = new MoveClassificationList();
    private evalQueue: Array<{previousState: Chonse2, state: Chonse2, move: IMoveResult}> = [];
    private isEvaluating: boolean = false;

    //Cosmetic stuff.
    squareHighlightStatuses: Array<Array<boolean>>;
    arrows: Array<Arrow>;
    isFlipped: boolean;

    isReadOnly: boolean = false;

    constructor(startingStates: Array<Chonse2> = [new Chonse2()], headers: PgnHeaders = new PgnHeaders())
    {
        this.pgnHeaders = headers;

        this.squareHighlightStatuses = BoardState.initializeHighlightStatuses();
        this.arrows = [];
        this.isFlipped = false;

        this.mainStateStack = [];
        this.mainStateStack.push(...startingStates);
        this.mainStackPointer = 0;
        this.mainMoveStack = [];

        this.divergenceStateStack = [];
        this.divergenceStackPointer = -1;
        this.divergenceMoveStack = [];
        this.divergenceEvalStack = [];
    }

    //#region STATES
    async pushState(state: Chonse2, move: IMoveResult)
    {
        //If the pointer was moved back, diverge from the main path.
        if (this.mainStackPointer != this.mainStateStack.length - 1 || this.isReadOnly)
        {
            let previousState: Chonse2;

            if (this.divergenceMoveStack.length != 0)
            {
                previousState = this.divergenceStateStack[this.divergenceStateStack.length - 1];
            }
            else 
            {
                previousState = this.mainStateStack[this.mainStackPointer];
            }

            this.divergenceStateStack.push(state);
            this.divergenceMoveStack.push(move);
            this.divergenceStackPointer++;

            if (this.engine && this.doEvaluateGame)
            {
                this.enqueueEvaluation(previousState, state, move);
            }
        }
        else //If the pointer is at the top of the stack, continue to add to it.
        {
            let previousState: Chonse2 = this.mainStateStack[this.mainStackPointer];

            this.mainStateStack.push(state);
            this.mainMoveStack.push(move);
            this.mainStackPointer++;

            if (this.engine && this.doEvaluateGame)
            {
                this.enqueueEvaluation(previousState, state, move);
            }
        }
    }

    getCurrentState(): Chonse2
    {
        //If we are diverging from the main game, return what was pushed to the secondary stack.
        if (this.divergenceStateStack.length != 0)
        {
            return this.divergenceStateStack[this.divergenceStackPointer];
        }

        //Otherwise, just get the current main state.
        return this.mainStateStack[this.mainStackPointer];    
    }
    //#endregion
    
    //#region MOVES
    getMostRecentMove(): IMoveResult 
    {
        //If we have any moves in the divergence stack, return the most recent one
        if (this.divergenceStackPointer >= 0) 
        {
            return this.divergenceMoveStack[this.divergenceStackPointer];
        }

        //Otherwise, check the main move stack using the pointer
        if (this.mainStackPointer > 0) { 
            return this.mainMoveStack[this.mainStackPointer - 1];
        }

        //If neither stack has a move (aka starting position), return a dummy move.
        return { result: false, notation: "N/A", fromCoord: "", toCoord: "", piece: PieceType.NONE, comment: ""};
    }

    getFutureMove(): IMoveResult 
    {
        //If there are moves in the divergence stack ahead of the pointer
        if (this.divergenceStackPointer + 1 < this.divergenceMoveStack.length) 
        {
            return this.divergenceMoveStack[this.divergenceStackPointer + 1];
        }

        //Otherwise, check the main move stack using the pointer
        if (this.mainStackPointer < this.mainMoveStack.length) 
        {
            return this.mainMoveStack[this.mainStackPointer];
        }

        //If no moves ahead, return a dummy move
        return { result: false, notation: "N/A", fromCoord: "", toCoord: "", piece: PieceType.NONE, comment: "" };
    }
    //#endregion

    //#region EVAL
    getMostRecentEval() : PositionEval | undefined
    {
        if (this.divergenceStackPointer >= 0) 
        {
            return this.divergenceEvalStack[this.divergenceStackPointer];
        }

        //Otherwise, check the main move stack using the pointer
        if (this.mainStackPointer > 0) { 
            if (this.eval)
            {
                return this.eval.positions[this.mainStackPointer];
            }
        }

        return undefined
    }

    getPreviousMostRecentEval(): PositionEval | undefined
    {
        if (this.divergenceStackPointer >= 0) 
        {
            return this.divergenceEvalStack[this.divergenceStackPointer - 1];
        }

        //Otherwise, check the main move stack using the pointer
        if (this.mainStackPointer > 0) { 
            if (this.eval)
            {
                return this.eval.positions[this.mainStackPointer - 1];
            }
        }

        return undefined
    }

    private enqueueEvaluation(previousState: Chonse2, state: Chonse2, move: IMoveResult)
    {
        this.evalQueue.push({ previousState, state, move });
        this.processEvaluationQueue();
    }
    private async processEvaluationQueue()
    {
        if (!this.engine || this.isEvaluating || this.evalQueue.length == 0)
        {
            return;
        } 
        
        this.isEvaluating = true;

        const { previousState, state, move } = this.evalQueue.shift()!;

        try
        {
            const depth = LocalStorageHelper.getNumber
            (
                LocalStorageHelper.ENGINE_DEPTH,
                UciEngine.DEFAULT_DEPTH
            );

            const resultOfEval = await this.engine.evaluateMove
            (
                previousState.getFEN(),
                state.getFEN(),
                move,
                depth
            );

            if (this.mainStackPointer != this.mainStateStack.length - 1 || this.isReadOnly)
            {
                this.divergenceEvalStack.push(resultOfEval);
            }
            else
            {
                this.eval?.positions.push(resultOfEval);
            }
        }
        finally
        {
            this.isEvaluating = false;
            this.processEvaluationQueue(); //Process next item in the queue.
        }
    }

    //#endregion

    //#region STACK TRAVERSAL
    goBackToStart()
    {
        //Simply back up to the first move.
        this.mainStackPointer = 0;
        this.divergenceStateStack.length = 0;
        this.divergenceMoveStack.length = 0;
        this.divergenceEvalStack.length = 0;
        this.divergenceStackPointer = -1;
    }

    goBack()
    {
        //If we aren't diverging from the main game, just move the pointer back by 1.
        if (this.divergenceStateStack.length == 0)
        {
            //Cannot go back if we are already at the first move.
            if (this.mainStackPointer == 0)
            {
                return;
            }

            //If we are somewhere past the first move, go back one.
            this.mainStackPointer--;
        }
        else //If we are diverging, just get rid of the state entirely.
        {
            if (this.eval)
            {
                this.divergenceEvalStack.pop();
            }

            this.divergenceStateStack.pop();
            this.divergenceMoveStack.pop();
            this.divergenceStackPointer --;
        }
    }

    goForward()
    {
        //If we are deviating from the main game, don't go forward (can't see the future).
        if (this.divergenceStateStack.length != 0)
        {
            return;
        }

        //If the stack pointer isn't already at the end, then go up by one.
        if (this.mainStackPointer != this.mainStateStack.length - 1)
        {
            this.mainStackPointer++;
        }
    }

    goForwardToEnd()
    {
        //If we are deviating from the main game, can't see into the future.
        if (this.divergenceStateStack.length != 0)
        {
            return;
        }

        //If we are already at the final move, don't do anything.
        if (this.mainStackPointer == this.mainStateStack.length - 1)
        {
            return;
        }

        //If we are going through the main game and we aren't at the end, go to the very end.
        this.mainStackPointer = this.mainStateStack.length - 1;
    }
    //#endregion

    static parsePGN(pgn: string, setAnalyzeFlag: boolean = false): BoardState
    {
        //States and PGN headers to be returned.
        const states: Array<Chonse2> = [];
        const moveStack: Array<IMoveResult> = [];
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
        
                        let moveResult: IMoveResult = {
                            result: false,
                            notation: "",
                            fromCoord: "",
                            toCoord: "",
                            piece: "",
                            comment: ""
                        }

                        //Special case: Kingside castle.
                        if (token == "O-O" || token == "O-O+" || token == "O-O#")
                        {
                            //From and to when castling kingside.
                            const kingSquare = turn ? Chonse2.WHITE_KING_SQUARE : Chonse2.BLACK_KING_SQUARE;
                            const toSquare = turn ? Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE : Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE;

                            //Perform the move on the deep copy.
                            moveResult = copyOfState.completeMove(kingSquare, toSquare);      
                            
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
                            moveResult = copyOfState.completeMove(kingSquare, toSquare);

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
                        moveResult = copyOfState.completeMove(passingCandidates[0], move.toCoordinate, move.promotion ?? undefined);
                        moveResult.comment = commentStr;
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

        boardState.pgnHeaders = pgnHeaders;
        boardState.mainMoveStack = moveStack;
        boardState.mainStateStack = states;
        boardState.isReadOnly = true;
        
        boardState.doEvaluateGame = setAnalyzeFlag;

        return boardState;
    }

    async evaluateGame( /*setProgress: (value: number) => void*/ ): Promise<void> 
    {
        //Don't evaluate it if the flag hasn't been set.
        if (!this.doEvaluateGame)
        {   
            return;
        }

        //Will initialize the engine based on user preference.
        await this.setEngineIfNotExists();

        //Sets up the ratings and progress setter.
        const params = this.getEvaluateGameParams();
        params.setEvaluationProgress = ( (value: number) => this.evalProgress = value);
        params.playersRatings = this.pgnHeaders.whiteElo && this.pgnHeaders.blackElo ? {white: Number(this.pgnHeaders.whiteElo), black: Number(this.pgnHeaders.blackElo)} : {}

        //Evaluate the game.
        if (this.engine)
        {
            const evalResult = await this.engine.evaluateGame(params);

            this.eval = evalResult;
        }

        //Sanitizes any excellent moves that also appear as best moves.
        for(let i = 0; i < this.mainMoveStack.length; i++)
        {
            const mv = this.mainMoveStack[i];
            const ev = this.eval?.positions[i];
            const previousEv = this.eval?.positions[i + 1]

            const moveCoords = mv.fromCoord+mv.toCoord;
            const bestCoords = ev?.bestMove;

            if (moveCoords == bestCoords && (previousEv?.moveClassification == MoveClassification.Excellent || previousEv?.moveClassification == MoveClassification.Okay))
            {
                previousEv.moveClassification = MoveClassification.Best;
            }
        }

        //Computes how many moves of each classification there are
        Object.values(MoveClassification).forEach( v => 
        {
            this.whiteMoveClassificationList.moves.set(v, []);
            this.blackMoveClassificationList.moves.set(v, [])
        })

        let turn = !this.mainStateStack[0].turn;

        this.eval?.positions.forEach( (pos, idx) =>
        {
            const map = turn ? this.whiteMoveClassificationList.moves : this.blackMoveClassificationList.moves;

            const correspondingArray = map.get(pos.moveClassification ?? MoveClassification.None);
            correspondingArray?.push(idx);

            turn = !turn;
        })
    }

    async setEngineIfNotExists()
    {
        if (!this.engine)
        {
            //Gets the engine type saved as per the user setting.
            const engineType: EngineName = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, EngineName.Stockfish18Lite) as EngineName;
            
            //Instantiate the engine with the factory.
            const engine: UciEngine = await UciEngine.getEngine(engineType);
            
            //Handle on it so it can be used later.
            this.engine = engine;
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
        const fens: string[] = this.mainStateStack.map( c2 => c2.getFEN() );
        const uciMoves: string[] = this.mainMoveStack.map(m => m.notation);
        const depth = LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.DEFAULT_DEPTH);

        return {fens, uciMoves, depth};
    }
}