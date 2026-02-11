import Chonse2 from "../../../lib/chonse2";
import { GameScore } from "../../../lib/game-state";
import { PieceType } from "../../../lib/piece-type";
import { Arrow } from "./arrow";
import { PgnFields, PgnHeaders } from "./pgn-misc";

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

    static parsePGN(pgn: string): Array<BoardState>
    {
        //The array to be returned.
        const states: Array<BoardState> = [];

        //A PGN is always divided by newlines.
        const lines = pgn.split("\n");

        //PGN has two components: Headers and moves. 
        let isHeaderMode = true;
        
        //To store the headers.
        const pgnHeaders = new PgnHeaders();

        //Scan each line of the file.
        for (let line of lines)
        {
            //If it hits a newline, the parser knows to switch modes.
            if (isHeaderMode && line == "")
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

                        //If we got this far, parse the token into a valid move.
                        console.log(token);
                    }
                }
            }
        }
        return states;
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