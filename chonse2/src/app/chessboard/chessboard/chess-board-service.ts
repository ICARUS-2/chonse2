import { Injectable } from "@angular/core";
import BoardState from "./board-state";
import Chonse2 from "../../../lib/chonse2";

@Injectable({ providedIn: 'root' })
export class ChessBoardService {
  private games = new Map<string, BoardState>();

    addGame(id: string, game: Chonse2): boolean
    {
        if (this.games.get(id))
        {
            return false;
        }

        //Applying the initialized fields to the interface.
        const boardState = new BoardState(game);

        //Add it.
        this.games.set(id, boardState);
        return true;
    }

    getGame(id: string): BoardState 
    {
        if (!this.games.has(id)) 
        {
            this.addGame(id, new Chonse2());
        }

        return this.games.get(id)!;
    }

    deleteGame(id: string) 
    {
        this.games.delete(id);
    }
}