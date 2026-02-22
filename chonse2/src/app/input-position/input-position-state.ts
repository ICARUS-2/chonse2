import Chonse2 from "../../lib/chonse2";
import { Arrow } from "../chessboard/chessboard/arrow";

export default class InputPositionState
{
    game: Chonse2 = new Chonse2();
    arrows: Arrow[] = [];
    squareHighlightStatuses: Array<Array<boolean>> = InputPositionState.initializeHighlightStatuses();
    isFlipped = false;

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