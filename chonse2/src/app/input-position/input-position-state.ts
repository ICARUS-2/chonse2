import { signal, WritableSignal } from "@angular/core";
import { Arrow } from "../chessboard/chessboard/arrow";
import { ChessConstants } from "../../libs/chess-game-lib/types/constants";
import EditorState from "./editor-state/editor-state";

export default class InputPositionState
{
    editorState: WritableSignal<EditorState> = signal<EditorState>(new EditorState());
    arrows: WritableSignal<Arrow[]> = signal<Arrow[]>([]);
    squareHighlightStatuses: WritableSignal<Array<Array<boolean>>> = signal<Array<Array<boolean>>>(InputPositionState.initializeHighlightStatuses());
    isFlipped: WritableSignal<boolean> = signal(false);

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
}