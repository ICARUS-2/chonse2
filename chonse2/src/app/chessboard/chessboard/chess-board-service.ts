import { Injectable } from "@angular/core";
import BoardState from "./board-state";
import Chonse2 from "../../../lib/chonse2";
import { Arrow } from "./arrow";

@Injectable({ providedIn: 'root' })
export class ChessBoardService {
  private games = new Map<string, BoardState>();

    addGame(id: string, game: Chonse2): boolean
    {
        if (this.games.get(id))
        {
            return false;
        }

        const highlightStatuses: Array<Array<boolean>> = ChessBoardService._initializeHighlightStatuses();
        const arrows: Array<Arrow> = [];

        const boardState: BoardState = {chessGame: game, squareHighlightStatuses : highlightStatuses, arrows: arrows}

        this.games.set(id, boardState);
        return true;
    }

    getGame(id: string): BoardState 
    {
        if (!this.games.has(id)) 
        {
            const highlightStatuses: Array<Array<boolean>> = ChessBoardService._initializeHighlightStatuses();
            const arrows: Array<Arrow> = [];
            const boardState: BoardState = {chessGame: new Chonse2(), squareHighlightStatuses : highlightStatuses, arrows: arrows}
            this.games.set(id, boardState);
        }

        return this.games.get(id)!;
    }

    deleteGame(id: string) 
    {
        this.games.delete(id);
    }

    private static _initializeHighlightStatuses(): Array<Array<boolean>>
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