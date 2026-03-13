import { PieceType } from "./piece-type";

export default class AlgebraicNotationMaker
{
    static readonly CHECK = "+";
    static readonly CHECKMATE = "#";
    static readonly CAPTURE = "x";
    static readonly PROMOTION = "=";
    static readonly KINGSIDE_CASTLE = "O-O";
    static readonly QUEENSIDE_CASTLE = "O-O-O";

    private _piece: string = "";
    private _fromSquare: string = "";
    private _toSquare: string = "";
    private _promotion: string = "";
    private _capture: boolean = false;
    private _checkOrMate: string = "";
    private _castleKingside: boolean = false;
    private _castleQueenside: boolean = false;

    addPiece(piece: string) : void
    {
        this._piece = piece;
    }

    addFromSquare(square: string) : void
    {
        this._fromSquare = square;
    }

    addToSquare(square: string) : void
    {
        this._toSquare = square;
    }

    addCheck() : void
    {
        this._checkOrMate = AlgebraicNotationMaker.CHECK;
    }

    addMate() : void
    { 
        this._checkOrMate = AlgebraicNotationMaker.CHECKMATE;
    }
 
    addPromotion(piece: string) : void
    {
        this._promotion = piece;
    }

    addCapture(): void
    {
        this._capture = true;
    }

    addKingsideCastle(): void
    {
        this._castleKingside = true;
    }

    addQueensideCastle(): void 
    {
        this._castleQueenside = true;
    }

    get() : string
    {
        let str: string = "";

        if (!this._castleKingside && !this._castleQueenside)
        {
            if (this._piece != PieceType.PAWN)
            {
                str += this._piece;
            }

            //if (this._piece == PieceType.PAWN && this._capture)
            //{
            //    str += this._fromSquare[0];
            //}
            //else 
            {
                str += this._fromSquare;
            }

            if (this._capture)
            {
                str += AlgebraicNotationMaker.CAPTURE;
            }

            str += this._toSquare;

            if (this._promotion)
            {
                str += AlgebraicNotationMaker.PROMOTION + this._promotion;
            }
        }
        else 
        {
            if (this._castleKingside)
            {
                str += AlgebraicNotationMaker.KINGSIDE_CASTLE;
            }

            if (this._castleQueenside)
            {
                str += AlgebraicNotationMaker.QUEENSIDE_CASTLE;
            }
        }

        if (this._checkOrMate)
        {
            str += this._checkOrMate;
        }

        return str;
    }
}