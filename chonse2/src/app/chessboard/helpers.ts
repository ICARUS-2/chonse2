import { computed } from "@angular/core";
import { MoveClassification } from "../../libs/engine-lib/types/enums";

export default class ChessboardHelper 
{
    static  getIconSourceForMoveClassification = (classification: MoveClassification) => computed( () => 
    {
        if (classification == MoveClassification.None)
        {
        return "";
        }

        return "icons/" + classification + ".png";
    })
}