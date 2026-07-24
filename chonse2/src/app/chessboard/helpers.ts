import { computed } from "@angular/core";
import { MoveClassification } from "../../libs/engine-lib/types/enums";
import { PieceType } from "../../libs/chonse2-lib/piece-type";
import LocalStorageHelper from "../../libs/local-storage-helper";

export default class ChessboardHelper 
{
    static getIconSourceForMoveClassification = (classification: MoveClassification) => computed( () => 
    {
        if (classification == MoveClassification.None)
        {
            return "";
        }

        return "icons/" + classification + ".webp";
    })

    static capitalizeFirstLetter(val: string) : string 
    {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    static PIECE_SETS = 
    [
        "cburnett",
        "maestro",
        "merida",
        "staunty"
    ]

    static DEFAULT_PIECE_SET = ChessboardHelper.PIECE_SETS[3];

    static getIconSourceForPiece(p: PieceType)
    {
        const selectedType = LocalStorageHelper.getString(LocalStorageHelper.CHESS_PIECES, ChessboardHelper.DEFAULT_PIECE_SET);

        if (!this.PIECE_SETS.includes(selectedType))
        {
            return `piece/${ChessboardHelper.DEFAULT_PIECE_SET}/${p}.svg`
        }

        return `piece/${selectedType}/${p}.svg`
    }

    static getNotation(moveResult: IMoveResult): string
    {
        const isVerbose = LocalStorageHelper.getBoolean(LocalStorageHelper.VERBOSE_NOTATION, false);

        if (isVerbose)
        {
            return moveResult.notation;
        }

        return moveResult.notationMinimal;
    }
}