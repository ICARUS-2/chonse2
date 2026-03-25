export class PieceColor
{
    static BLACK = "b";
    static WHITE = "w";

    static getOpposite(color: string)
    {
        if (color == PieceColor.WHITE)
        {
            return PieceColor.BLACK;
        }

        if (color == PieceColor.BLACK)
        {
            return PieceColor.WHITE;
        }

        return "";
    }
}