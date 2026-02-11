import { Injectable } from "@angular/core";
import BoardState from "./board-state";
import Chonse2 from "../../../lib/chonse2";

@Injectable({ providedIn: 'root' })
export class ChessBoardService {
  private games = new Map<string, BoardState>();

    addGame(id: string, board: BoardState): boolean
    {
        if (this.games.get(id))
        {
            return false;
        }

        //Add it.
        this.games.set(id, board);
        return true;
    }

    getGame(id: string): BoardState 
    {
        if (!this.games.has(id)) 
        {
            this.addGame(id, new BoardState());
        }

        return this.games.get(id)!;
    }

    deleteGame(id: string) 
    {
        this.games.delete(id);
    }
}