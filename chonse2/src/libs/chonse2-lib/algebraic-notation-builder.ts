import Chonse2 from "./chonse2";
import { PieceColor } from "./piece-color";
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

    //get the full verbose notation
    get() : string
    {
        return this._getInternal(undefined, undefined, undefined);
    }

    //get the minimal notation
    getMinimal(board: Chonse2, toCoord: string, piece: string): string
    {
        return this._getInternal(board, toCoord, piece);
    }

    private _getInternal(board: Chonse2 | undefined, toCoord: string | undefined, piece: string | undefined)
    {
        let str: string = "";

        if (!this._castleKingside && !this._castleQueenside)
        {
            if (this._piece != PieceType.PAWN)
            {
                str += this._piece;
            }

            //If we are doing verbose notation, just append the from square.
            if (board == undefined && toCoord == undefined && piece == undefined)
            {
                str += this._fromSquare;

            } //If we are doing minimal notation, only append the fromsquare if there is an overlap as to what piece can move to the tosquare.
            else if (board instanceof(Chonse2) && toCoord != undefined && piece != undefined)
            {
                let overlap: boolean = false;
                const isPawn: boolean = piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN

                //No overlap for pawns, only one of them can move to a certain square.
                if (!isPawn)
                {
                    //Need to check all the pieces that can hit the to square.
                    const piecesThatHitSquare = piece.startsWith(PieceColor.WHITE) ? board.getPiecesThatHitSquare(toCoord).whitePieces : board.getPiecesThatHitSquare(toCoord).blackPieces ;

                    //If there is at least one other piece, append the fromsquare.
                    for(let i = 0; i < piecesThatHitSquare.length; i++)
                    {
                        const pieceToCheck = piecesThatHitSquare[i];

                        if (pieceToCheck == piece)
                        {
                            overlap = true;
                            break;
                        }
                    }
                }

                if (isPawn)
                {
                    if (this._capture)
                    {
                        str += this._fromSquare[0];
                    }
                }

                if (overlap)
                {
                    str += this._fromSquare;
                }
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