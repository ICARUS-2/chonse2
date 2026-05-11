import { computed } from "@angular/core";
import { MoveClassification } from "../../libs/engine-lib/types/enums";

export default class ChessboardHelper 
{
    static getIconSourceForMoveClassification = (classification: MoveClassification) => computed( () => 
    {
        if (classification == MoveClassification.None)
        {
        return "";
        }

        return "icons/" + classification + ".png";
    })

    static capitalizeFirstLetter(val: string) : string 
    {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }
}