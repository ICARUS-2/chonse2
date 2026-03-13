import { signal, WritableSignal } from "@angular/core";
import Chonse2 from "../../chonse2-lib/chonse2";
import { Arrow } from "../chessboard/chessboard/arrow";

export default class InputPositionState
{
    game: WritableSignal<Chonse2> = signal<Chonse2>(new Chonse2());
    arrows: WritableSignal<Arrow[]> = signal<Arrow[]>([]);
    squareHighlightStatuses: WritableSignal<Array<Array<boolean>>> = signal<Array<Array<boolean>>>(InputPositionState.initializeHighlightStatuses());
    isFlipped: WritableSignal<boolean> = signal(false);

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