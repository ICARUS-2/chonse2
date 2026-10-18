import { Service } from "@angular/core";
import InputPositionState from "./input-position-state";

@Service()
export class InputPositionService {
  private models = new Map<string, InputPositionState>();

    addGame(id: string, state: InputPositionState): boolean
    {
        if (this.models.get(id))
        {
            return false;
        }

        //Add it.
        this.models.set(id, state);
        return true;
    }

    getGame(id: string): InputPositionState 
    {
        /*
        if (!this.games.has(id)) 
        {
            this.addGame(id, new BoardState());
        }*/

        return this.models.get(id)!;
    }

    deleteGame(id: string) 
    {
        this.models.delete(id);
    }
}