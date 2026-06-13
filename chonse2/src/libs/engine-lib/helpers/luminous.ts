import Chonse2 from "../../chonse2-lib/chonse2";
import { LineEval } from "../types/eval";
import { Square } from "./chess";
import { ALTERNATIVES_COLLAPSE_SIGNIFICATLY_WIN_PERCENTAGE_CHANGE, concatenateUciParams } from "./moveClassification";
import { getLineWinPercentage } from "./winPercentage";

export default class LuminousHelper
{
    public static isMoveLuminousSacrifice
    (
        beforeFen: string,
        afterFen: string,
        
        previousLines: Array<LineEval>,
        currentLines: Array<LineEval>,

        lastWinPct: number,
        currentWinPct: number,

        uciPlayedMove: {from: Square; to: Square; promotion?: string | undefined;},

    ): boolean
    {
        if (!beforeFen || !afterFen)
        {
            return false;
        }

        //The state of the board before the move was made.
        const beforeState = Chonse2.instantiateFromFen(beforeFen);
        
        //The state after the candidate move was made.
        const afterState = Chonse2.instantiateFromFen(afterFen);

        const playedMove = concatenateUciParams(uciPlayedMove);

        //Check if (this was the best move || playedMove in previousLines and !alternativesCollapseSignificantly)
        const wasMoveGood = LuminousHelper._wasMoveGood(playedMove, beforeFen, previousLines, lastWinPct, currentWinPct)

        console.log(wasMoveGood)
        //check if played move was not just a simple recapture by verifying that the moved piece did 
        //not just take a piece with the same value.

        
        //Check if the player did indeed leave the moved piece hanging.

        //Check that none of the lines in currentLines involve actually capturing that piece.

        return false;
    }

    private static _wasMoveGood(playedMove: string, previousFen: string, previousLines: Array<LineEval>, lastWinPct: number, currentWinPct: number): boolean 
    {
        //If they played the best move of course it was good.
        if (previousLines[0].pv[0] == playedMove)
        {
            return true;
        }

        //If the move they played wasn't in the top engine moves, don't consider it.
        const moveInTopLines = previousLines.filter( (_, index) => index != 0 ).some( line => line.pv[0] == playedMove);
        if (!moveInTopLines)
        {
            return false;
        }

        //If it was in the top moves but wasn't the best move, ensure alternative lines do not collapse win percentage significantly.
        const alternativeLine = previousLines.find((line, index) => (line.pv[0] !== playedMove && index != 0));
        if (alternativeLine)
        {
            const sideToMove = previousFen.split(" ")[1];
            const isWhiteMove = sideToMove === "w";

            const alternativeWinPct = getLineWinPercentage(alternativeLine);
            const alternativeWinPctChange = (alternativeWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);
            const winPctChange = (currentWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);
            
            //At this point, we know the player played a move that wasn't the best but was present in the alternative top lines.
            //So, check if the played move would collapse the win percentage. If it hasn't, it was probably a good move.
            const alternativesCollapseSignificantly = alternativeWinPctChange < winPctChange - ALTERNATIVES_COLLAPSE_SIGNIFICATLY_WIN_PERCENTAGE_CHANGE;

            return !alternativesCollapseSignificantly;
        }

        return false;
    }

    private static _isSimplePieceRecapture(): boolean
    {
        return false;
    }

    private static _didMoveLeavePieceVulnerable(): boolean 
    {
        return false;
    }

    private static _opponentShouldntRecapture()
    {
        return false;
    }
}