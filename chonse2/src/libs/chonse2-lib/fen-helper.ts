import CastlingRights from "./castling-rights";
import { PieceType } from "./piece-type";

export default class FenHelper
{
    //Converts a piece state piece to a FEN piece (used to convert a board to the FEN)
    static getFenPieceFromPiece(piece: string): string
    {
        switch (piece)
        {
            case PieceType.WHITE_PAWN:   return PieceType.PAWN;
            case PieceType.WHITE_ROOK:   return PieceType.ROOK;
            case PieceType.WHITE_KNIGHT: return PieceType.KNIGHT;
            case PieceType.WHITE_BISHOP: return PieceType.BISHOP;
            case PieceType.WHITE_QUEEN:  return PieceType.QUEEN;
            case PieceType.WHITE_KING:   return PieceType.KING;

            case PieceType.BLACK_PAWN:   return PieceType.PAWN.toLowerCase();
            case PieceType.BLACK_ROOK:   return PieceType.ROOK.toLowerCase();
            case PieceType.BLACK_KNIGHT: return PieceType.KNIGHT.toLowerCase();
            case PieceType.BLACK_BISHOP: return PieceType.BISHOP.toLowerCase();
            case PieceType.BLACK_QUEEN:  return PieceType.QUEEN.toLowerCase();
            case PieceType.BLACK_KING:   return PieceType.KING.toLowerCase();

            default:
                return PieceType.NONE;
        }
    }
    
    //Converts a piece from a FEN to the piece state (used for creating a new board from an existing FEN)
    static getPieceFromFenPiece(fenPiece: string): string
    {
        switch (fenPiece)
        {
            case PieceType.PAWN:   return PieceType.WHITE_PAWN;
            case PieceType.ROOK:   return PieceType.WHITE_ROOK;
            case PieceType.KNIGHT: return PieceType.WHITE_KNIGHT;
            case PieceType.BISHOP: return PieceType.WHITE_BISHOP;
            case PieceType.QUEEN:  return PieceType.WHITE_QUEEN;
            case PieceType.KING:   return PieceType.WHITE_KING;

            case PieceType.PAWN.toLowerCase():   return PieceType.BLACK_PAWN;
            case PieceType.ROOK.toLowerCase():   return PieceType.BLACK_ROOK;
            case PieceType.KNIGHT.toLowerCase(): return PieceType.BLACK_KNIGHT;
            case PieceType.BISHOP.toLowerCase(): return PieceType.BLACK_BISHOP;
            case PieceType.QUEEN.toLowerCase():  return PieceType.BLACK_QUEEN;
            case PieceType.KING.toLowerCase():   return PieceType.BLACK_KING;

            default:
                return PieceType.NONE;
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

    static getCastlingRightsFromFen(fenCastling: string):
    {
        white: CastlingRights,
        black: CastlingRights
    }
    {
        const white = new CastlingRights();
        const black = new CastlingRights();

        //start with no rights
        white.removeBothCastlingRights();
        black.removeBothCastlingRights();

        //if the castling includes a certain piece type, set its castling rights.
        if (fenCastling.includes(PieceType.KING))
            white.kingSide = true;

        if (fenCastling.includes(PieceType.KING))
            white.queenSide = true;

        if (fenCastling.includes(PieceType.KING.toLowerCase()))
            black.kingSide = true;

        if (fenCastling.includes(PieceType.QUEEN.toLowerCase()))
            black.queenSide = true;

        return { white, black };
}
}