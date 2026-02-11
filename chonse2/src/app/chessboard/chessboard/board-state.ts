import Chonse2 from "../../../lib/chonse2";
import { GameScore } from "../../../lib/game-state";
import { PieceColor } from "../../../lib/piece-color";
import { PieceType } from "../../../lib/piece-type";
import { Arrow } from "./arrow";
import { PgnFields, PgnHeaders, SanMove } from "./pgn-misc";

export default class BoardState
{
    pgnHeaders: PgnHeaders;

    mainStateStack: Array<Chonse2>;    
    mainStackPointer: number;
    mainMoveStack: Array<IMoveResult>;
    
    divergenceStack: Array<Chonse2>;
    divergenceStackPointer: number;
    divergenceMoveStack: Array<IMoveResult>

    squareHighlightStatuses: Array<Array<boolean>>;
    arrows: Array<Arrow>;
    isFlipped: boolean;

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

        this.divergenceStack = [];
        this.divergenceStackPointer = -1;
        this.divergenceMoveStack = [];
    }

    pushState(state: Chonse2, move: IMoveResult)
    {
        //If the pointer was moved back, diverge from the main path.
        if (this.mainStackPointer != this.mainStateStack.length - 1)
        {
            this.divergenceStack.push(state);
            this.divergenceMoveStack.push(move);
            this.divergenceStackPointer++;
        }
        else //If the pointer is at the top of the stack, continue to add to it.
        {
            this.mainStateStack.push(state);
            this.mainMoveStack.push(move);
            this.mainStackPointer++;
        }
    }

    getCurrentState(): Chonse2
    {
        //If we are diverging from the main game, return what was pushed to the secondary stack.
        if (this.divergenceStack.length != 0)
        {
            return this.divergenceStack[this.divergenceStackPointer];
        }

        //Otherwise, just get the current main state.
        return this.mainStateStack[this.mainStackPointer];    
    }
    
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
        return { result: false, notation: "N/A", fromCoord: "", toCoord: "", piece: PieceType.NONE};
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
        return { result: false, notation: "N/A", fromCoord: "", toCoord: "", piece: PieceType.NONE };
    }

    goBackToStart()
    {
        //Simply back up to the first move.
        this.mainStackPointer = 0;
        this.divergenceStack.length = 0;
        this.divergenceMoveStack.length = 0;
        this.divergenceStackPointer = -1;
    }

    goBack()
    {
        //If we aren't diverging from the main game, just move the pointer back by 1.
        if (this.divergenceStack.length == 0)
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
            this.divergenceStack.pop();
            this.divergenceMoveStack.pop();
            this.divergenceStackPointer --;
        }
    }

    goForward()
    {
        //If we are deviating from the main game, don't go forward (can't see the future).
        if (this.divergenceStack.length != 0)
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
        if (this.divergenceStack.length != 0)
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

    static parsePGN(pgn: string): BoardState
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

                    const tokens = line.split(" ");

                    for (let token of tokens)
                    {
                        //Check end of comment.
                        if (commentState)
                        {
                            if (token.includes("}"))
                            {
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
                            piece: ""
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
                        moveResult = copyOfState.completeMove(passingCandidates[0], move.toCoordinate);
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
        
        return boardState;
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
}