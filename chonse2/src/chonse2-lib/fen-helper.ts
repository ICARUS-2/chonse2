import CastlingRights from "./castling-rights";
import { PieceType } from "./piece-type";

export default class FenHelper
{
    static getFenPieceFromPiece(piece: string): string
    {
        switch (piece)
        {
            case "wP": return "P";
            case "wR": return "R";
            case "wN": return "N";
            case "wB": return "B";
            case "wQ": return "Q";
            case "wK": return "K";

            case "bP": return "p";
            case "bR": return "r";
            case "bN": return "n";
            case "bB": return "b";
            case "bQ": return "q";
            case "bK": return "k";

            default:
                return "";
        }
    }
    
    static getFenCastlingRights(white: CastlingRights, black: CastlingRights)
    {
        if (!white.kingSide && !white.queenSide && !black.kingSide && !black.queenSide)
        {
            return "-"
        }

        let fenCastlingRights: string = "";

        if (white.kingSide)
        {
            fenCastlingRights += FenHelper.getFenPieceFromPiece(PieceType.WHITE_KING);
        }

        if (white.queenSide)
        {
            fenCastlingRights += FenHelper.getFenPieceFromPiece(PieceType.WHITE_QUEEN);
        }

        if (black.kingSide)
        {
            fenCastlingRights += FenHelper.getFenPieceFromPiece(PieceType.BLACK_KING);
        }

        if (black.queenSide)
        {
            fenCastlingRights += FenHelper.getFenPieceFromPiece(PieceType.BLACK_QUEEN);
        }
        
        return fenCastlingRights;
    }
}