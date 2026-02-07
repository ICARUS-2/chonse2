import { Injectable } from "@angular/core";
import Chonse2 from "../../../lib/chonse2";

@Injectable({ providedIn: 'root' })
export class ChessGameService {
  private games = new Map<string, Chonse2>();

    addGame(id: string, game: Chonse2): boolean
    {
        if (this.games.get(id))
        {
            return false;
        }

        this.games.set(id, game);
        return true;
    }

    getGame(id: string): Chonse2 
    {
        if (!this.games.has(id)) 
        {
            this.games.set(id, new Chonse2());
        }

        return this.games.get(id)!;
    }

    deleteGame(id: string) 
    {
        this.games.delete(id);
    }
}