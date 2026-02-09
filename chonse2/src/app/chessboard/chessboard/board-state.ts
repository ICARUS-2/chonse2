import Chonse2 from "../../../lib/chonse2";
import { Arrow } from "./arrow";

export default class BoardState
{
    mainStateStack: Array<Chonse2>;    
    mainStackPointer: number;
    mainMoveStack: Array<IMoveResult>;
    
    divergenceStack: Array<Chonse2>;
    divergenceStackPointer: number;
    divergenceMoveStack: Array<IMoveResult>

    squareHighlightStatuses: Array<Array<boolean>>;
    arrows: Array<Arrow>;
    isFlipped: boolean;

    constructor(startingState: Chonse2 = new Chonse2())
    {
        this.squareHighlightStatuses = BoardState.initializeHighlightStatuses();
        this.arrows = [];
        this.isFlipped = false;

        this.mainStateStack = [];
        this.mainStateStack.push(startingState);
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