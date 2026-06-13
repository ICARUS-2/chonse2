import Chonse2 from "../../chonse2-lib/chonse2";
import Chonse2Extensions from "../../chonse2-lib/extensions";
import PieceMaterial from "../../chonse2-lib/piece-material";
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

        const playedMove = concatenateUciParams(uciPlayedMove);

        //If move was either the best move or amonst the alternate lines that did not collapse eval significantly.
        const wasMoveGood = LuminousHelper._wasMoveGood(playedMove, beforeFen, previousLines, lastWinPct, currentWinPct)
        if (!wasMoveGood)
        {
             return false;
        }

        //Board state before and after the candidate move.
        const beforeState = Chonse2.instantiateFromFen(beforeFen);
        const afterState = Chonse2.instantiateFromFen(afterFen);


        //check if played move was not just a simple recapture by verifying that the moved piece did 
        //not just take a piece with the same value.
        const isSimplePieceCapture = LuminousHelper._wasSimplePieceCapture(beforeState, uciPlayedMove);
        if (isSimplePieceCapture)
        {
            return false;
        }

        //Check if the player did indeed leave the moved piece hanging.
        const didMoveLeavePieceVulnerable = LuminousHelper._didMoveLeavePieceVulnerable(afterState, uciPlayedMove);
        if (!didMoveLeavePieceVulnerable)
        {
            return false;
        }

        //Check if the opponent should recapture after player hung the piece.
        const opponentShouldRecapture = LuminousHelper.shouldOpponentRecapture(uciPlayedMove, currentLines);
        if (opponentShouldRecapture)
        {
            return false;
        }

        //Check that none of the lines in currentLines involve actually capturing that piece.

        return true;
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

    private static _wasSimplePieceCapture(beforeState: Chonse2, uciPlayedMove:{from: Square; to: Square; promotion?: string | undefined;} ): boolean
    {
        //Check the piece that moved and potentially the piece it captured.
        const pieceMoved: string = Chonse2Extensions.findPieceAtCoordinate(beforeState, uciPlayedMove.from);
        const pieceInToSquare: string = Chonse2Extensions.findPieceAtCoordinate(beforeState, uciPlayedMove.to);

        if (!pieceInToSquare)
        {
            return false;
        }

        //Check material value of the piece that was captured - maybe the "sacrifice" is just a trade.
        const movedPieceMaterial = PieceMaterial.getMaterialFromPiece(pieceMoved);
        const capturedPieceMaterial = PieceMaterial.getMaterialFromPiece(pieceInToSquare);

        //If the person captured a higher value or equal piece, then this isn't really a sacrifice, and can't be considered luminous.
        if (capturedPieceMaterial >= movedPieceMaterial)
        {
            return true;
        }
        return false;
    }

    private static _didMoveLeavePieceVulnerable(afterState: Chonse2, uciPlayedMove:{from: Square; to: Square; promotion?: string | undefined;} ): boolean 
    {
        const isHangingPiece = Chonse2Extensions.doesSquareHaveHangingPiece(afterState, uciPlayedMove.to);

        return isHangingPiece;
    }

    private static shouldOpponentRecapture(uciPlayedMove:{from: Square; to: Square; promotion?: string | undefined;}, currentLines: Array<LineEval>)
    {
        const opponentShouldRecapture = currentLines.some( line => line.pv[0]?.includes(uciPlayedMove.to) );

        return opponentShouldRecapture;
    }
}