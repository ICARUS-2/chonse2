import Chonse2 from "../../../lib/chonse2";
import { Arrow } from "./arrow";

export default class BoardState
{
    mainStateStack: Array<Chonse2>;    
    mainStackPointer: number;
    mainAlgebraicStack: Array<string>;
    
    deviationStack: Array<Chonse2>;
    deviationStackPointer: number;

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
        this.mainAlgebraicStack = [];

        this.deviationStack = [];
        this.deviationStackPointer = 0;
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