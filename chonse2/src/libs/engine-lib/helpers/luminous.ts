import Chonse2 from "../../chonse2-lib/chonse2";
import Chonse2Extensions from "../../chonse2-lib/extensions";
import { PieceColor } from "../../chonse2-lib/piece-color";
import PieceMaterial from "../../chonse2-lib/piece-material";
import { PieceType } from "../../chonse2-lib/piece-type";
import { LineEval } from "../types/eval";
import { Square } from "./chess";
import { ALTERNATIVES_COLLAPSE_SIGNIFICATLY_WIN_PERCENTAGE_CHANGE, concatenateUciParams } from "./moveClassification";
import { getLineWinPercentage } from "./winPercentage";

export default class LuminousDetector
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
        const wasMoveGood = LuminousDetector._wasMoveGood(playedMove, beforeFen, previousLines, lastWinPct, currentWinPct)
        if (!wasMoveGood)
        {
            return false;
        }

        //Board state before and after the candidate move.
        const beforeState = Chonse2.instantiateFromFen(beforeFen);
        const afterState = Chonse2.instantiateFromFen(afterFen);

        //Don't count a pawn hang as brilliant.
        const pieceMoved = afterState.findPieceAtCoordinate(uciPlayedMove.to)
        if (pieceMoved == PieceType.WHITE_PAWN || pieceMoved == PieceType.BLACK_PAWN)
        {
            return false;
        }

        //check if played move was not just a simple recapture by verifying that the moved piece did 
        //not just take a piece with the same value or greater.
        const isSimplePieceCapture = LuminousDetector._wasSimplePieceCapture(beforeState, uciPlayedMove);
        if (isSimplePieceCapture)
        {
            return false;
        }

        //Check if the player did indeed leave the moved piece hanging.
        const didMoveLeavePieceVulnerable = LuminousDetector._didMoveLeavePieceVulnerable(afterState, uciPlayedMove);
        if (!didMoveLeavePieceVulnerable)
        {
            return false;
        }

        //Check if the opponent should recapture after player hung the piece (unless capturing the sacked piece simply prolongs mate)
        const opponentShouldRecapture = LuminousDetector._shouldOpponentRecaptureIfMateNotForced(afterFen, uciPlayedMove, currentLines);
        if (opponentShouldRecapture)
        {
            return false;
        }

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
        const pieceMoved: string = beforeState.findPieceAtCoordinate(uciPlayedMove.from);
        const pieceInToSquare: string = beforeState.findPieceAtCoordinate(uciPlayedMove.to);

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
        //If the piece isn't hanging, don't consider it a luminous sacrifice.
        const isHangingPiece = Chonse2Extensions.doesSquareHaveHangingPiece(afterState, uciPlayedMove.to);
        if (!isHangingPiece)
        {
            return false;
        }
        
        //Now we need to see if this hanging piece can actually be recaptured in any way.
        let canPieceActuallyBeRecaptured = false;

        const sideThatCanPotentiallyRecapture = afterState.turn ? PieceColor.WHITE : PieceColor.BLACK;
        const pieceDataForOpponent = afterState.getAllPiecesAndCoordsByColor(sideThatCanPotentiallyRecapture);

        for(let i = 0; i < pieceDataForOpponent.coords.length; i++)
        {
            const legalMoves = afterState.getLegalMoves(pieceDataForOpponent.coords[i]);

            //If the piece can indeed be recaptured, it's a candidate. If it cannot, then it isn't technically a sacrifice.
            if (legalMoves.includes(uciPlayedMove.to))
            {
                canPieceActuallyBeRecaptured = true;
            }
        }

        return canPieceActuallyBeRecaptured;
    }

    private static _shouldOpponentRecaptureIfMateNotForced(afterFen: string, uciPlayedMove:{from: Square; to: Square; promotion?: string | undefined;}, currentLines: Array<LineEval>)
    {
        let recaptureIndex = -1;

        //Check: Does the engine want to recapture?
        for(let i = 0; i < currentLines.length; i++)
        {
            const line = currentLines[i];

            if (line.pv[0]?.includes(uciPlayedMove.to))
            {
                recaptureIndex = i;
                break;
            }
        }

        //If the engine line doesn't want this hanging piece captured, then it's certainly luminous.
        const doesLineContainRecapture = recaptureIndex !== -1;
        if (!doesLineContainRecapture)
        {
            return false;
        }


        //Get the line that involves the recapture of the sacrificed piece.
        const recaptureLine = currentLines[recaptureIndex];
        
        //If the line that involved recapturing has mate on the board, ensure that it's the person who sacked the piece that actually has mate here.
        if (recaptureLine.mate)
        {
            const sideToMove = afterFen.split(" ")[1];
            const isWhiteMove = sideToMove === "w";
            if (isWhiteMove && recaptureLine.mate > 0)
            {
                return true;
            }

            if (!isWhiteMove && recaptureLine.mate < 0)
            {
                return true;
            }
        }

        console.log(recaptureLine.mate);

        //If this top or near-top line involved recapturing the hanging piece but mate is still on the board, it's luminous.
        return !recaptureLine.mate;
    }
}