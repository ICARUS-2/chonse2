import { PieceType } from "./piece-type";

export default class PieceMaterial
{
    static PAWN: number = 1;
    static KNIGHT: number = 3;
    static BISHOP: number = 3;
    static ROOK: number = 5;
    static QUEEN: number = 9;
    static KING: number = 9999;

    static getMaterialFromPiece(piece: string): number
    {
        if (piece == PieceType.BLACK_PAWN || piece == PieceType.WHITE_PAWN)
        {
            return PieceMaterial.PAWN;
        }

        if (piece == PieceType.BLACK_KNIGHT || piece == PieceType.WHITE_KNIGHT)
        {
            return PieceMaterial.KNIGHT;
        }

        if (piece == PieceType.BLACK_BISHOP || piece == PieceType.WHITE_BISHOP)
        {
            return PieceMaterial.BISHOP;
        }

        if (piece == PieceType.BLACK_ROOK || piece == PieceType.WHITE_ROOK)
        {
            return PieceMaterial.ROOK;
        }

        if (piece == PieceType.BLACK_QUEEN || piece == PieceType.WHITE_QUEEN)
        {
            return PieceMaterial.QUEEN;
        }

        //how the hell does this even get called...
        if (piece == PieceType.BLACK_KING || piece == PieceType.WHITE_KING)
        {
            return PieceMaterial.KING;
        }

        return 0;
    }
}