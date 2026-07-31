import { Piece, attacks, makeSquare, parseSquare } from "chessops";
import IChessGame from "../../i-chess-game";
import { CastlingRightsType } from "../../types/castling-rights-type";
import { GameState } from "../../types/game-state";
import { IMoveResult } from "../../types/move-result";
import { PieceColor } from "../../types/piece-color";
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen'
import { PieceType } from "../../types/piece-type";
import { ChessConstants } from "../../types/constants";
import PieceMaterial from "../../types/piece-material";

export default class ChessopsBoard implements IChessGame
{
    _inst: Chess;

    constructor(fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    {
        const setup = parseFen(fen).unwrap();
        this._inst = Chess.fromSetup(setup).unwrap();
    }

    //#region Pieces and squares.

    //Should retrieve an 8x8 array representing the board with its pieces (wP, wK, bN, etc).
    public getPieceState(): string[][]
    {
        const arr = [];

        //Loop through rank
        for (let rank = ChessConstants.SIZE - 1; rank >= 0; rank--) 
        {
            const row = [];
            for (let file = 0; file < ChessConstants.SIZE; file++) 
            {
                //Square code in board.
                const square = rank * ChessConstants.SIZE + file;

                //Piece object inside the square.
                const squareContent: Piece | undefined = this._inst.board.get(square);
                
                //Convert piece to use piece code (ex wP for white pawn.)
                const convertedPiece = this._convertPiece(squareContent);

                //Add to rank.
                row.push(convertedPiece);
            }

            //Add rank.
            arr.push(row);
        }

        return arr
    }

    //Takes in a coordinate and returns the type of piece that's in it.
    public findPieceAtCoordinate(coord: string): string
    {
        //Parse the square into its internal number code.
        const sqr = parseSquare(coord);

        //If it doesn't exist, don't return any piece.
        if (sqr === undefined)
        {
            throw new Error("Invalid square for coord " + coord);
        }

        //Get piece object on board.
        const piece = this._inst.board.get(sqr);

        //Convert it to our standard.
        const convertedPiece = this._convertPiece(piece);

        //And return it.
        return convertedPiece;
    }

    //Retrieves the king coordinate for the passed color.
    public getKingCoordinate(kingColor: string): string
    {
        //White king.
        if (kingColor == PieceColor.WHITE)
        {
            const whiteKing = this._inst.board.kingOf("white");

            if (whiteKing)
            {
                return makeSquare(whiteKing);
            }
        }

        //Black king.
        if (kingColor == PieceColor.BLACK)
        {
            const blackKing = this._inst.board.kingOf("black");

            if (blackKing)
            {
                return makeSquare(blackKing);
            }
        }

        return "";
    }

    //Gets all the pieces pointed at a given square.
    public getPiecesThatHitSquare(coord: string): { whiteCoords: Array<string>, whitePieces: Array<string>, blackCoords: Array<string>, blackPieces: Array<string> }
    {
        //Initial array.
        const attackers = [];

        //Final arrays.
        const whiteCoords: Array<string> = [];
        const whitePieces: Array<string> = [];
        const blackCoords: Array<string> = [];
        const blackPieces: Array<string> = [];
        const square = parseSquare(coord);

        if (!square)
        {
            return {whiteCoords, whitePieces, blackCoords, blackPieces};    
        }

        const board = this._inst.board;


        //Each square in the board.
        for (const attackerSquare of board) 
        {
            //Get what's in it.
            const piece = board.get(attackerSquare[0]);

            //If there's actually anything in it:
            if (piece) 
            {
                //Check if it attacks anything.
                if (attacks(piece, attackerSquare[0], board.occupied).has(square)) 
                {
                    //If it does, push its data.
                    attackers.push({ square: attackerSquare[0], piece });
                }
            }
        }

        //Then divide up the data by piece color.
        attackers.forEach( a => 
            {
                //Get the piece to our standard.
                const convertedPiece = this._convertPiece(a.piece);

                if (convertedPiece.startsWith("w"))
                {
                    //Converts square to number (ex: 12 -> e4)
                    whiteCoords.push(makeSquare(a.square));
                    whitePieces.push(convertedPiece);
                }

                if (convertedPiece.startsWith("b"))
                {
                    blackCoords.push(makeSquare(a.square));
                    blackPieces.push(convertedPiece);
                }
            }
        )

        return {whiteCoords, whitePieces, blackCoords, blackPieces};
    }

    //Retrieves parallel arrays of all pieces/coords of the passed color.
    public getAllPiecesAndCoordsByColor(color: string): {pieces: Array<string>, coords: Array<string>}
    {
        if (color != PieceColor.WHITE && color != PieceColor.BLACK)
        {
        return { pieces: [], coords: [] };
        }

        const pieces = [];
        const coordinates = [];

        const _pieceState = this.getPieceState()

        //Loop through each of these to get the coordinates + pieces.
        for(let i = 0; i < ChessConstants.COORDS.length; i++)
        {
        for(let j = 0; j < ChessConstants.COORDS[i].length; j++)
        {
            const piece = _pieceState[i][j];

            if ( piece.startsWith(color))
            {
            pieces.push(piece);
            coordinates.push(ChessConstants.COORDS[i][j])
            }
        }
        }

        return { pieces: pieces, coords : coordinates};
    }

    //If the passed color's king is in check.
    public isInCheck(kingColor: string): boolean
    {
        const board = this._inst.board;

        //If we are verifying the white king:
        if (kingColor == PieceColor.WHITE)
        {
        //Get the king.
        const whiteKingSquare = board.kingOf('white');

        //If the king is actually there.
        if (whiteKingSquare !== undefined) 
        {
            //Get what attacks it.
            const attackers = this.getPiecesThatHitSquare(makeSquare(whiteKingSquare));

            //If something attacks it, it's in check.
            if (attackers.blackCoords.length > 0) 
            {
            return true;
            }
        }
        }

        //If we are verifying the black king:
        if (kingColor == PieceColor.BLACK)
        {
            const blackKingSquare = board.kingOf('black');

            //If the king is actually there.
            if (blackKingSquare !== undefined) 
            {
                //Get what attacks it.
                const attackers = this.getPiecesThatHitSquare(makeSquare(blackKingSquare));

                //If something attacks it, it's in check.
                if (attackers.whiteCoords.length > 0) 
                {
                return true;
                }
            }
        }

        return false;
    }

    //Positive number signifies that white is up, negative signifies black is up.
    public getMaterialAdvantage(): number 
    {
        const board = this._inst.board; 
        let whiteValue = 0;
        let blackValue = 0;

        for (const [_, piece] of board) 
        {
            const convertedPiece = this._convertPiece(piece)
            if (convertedPiece !== PieceType.WHITE_KING && convertedPiece !== PieceType.BLACK_KING)
            {
                const value = PieceMaterial.getMaterialFromPiece(convertedPiece);

                if (piece.color === 'white') 
                {
                    whiteValue += value;
                } 
                else 
                {
                    blackValue += value;
                }
            }
        }

        return whiteValue - blackValue;  // Positive = white advantage, negative = black advantage
    }

    //Get captured pieces by color
    public getPiecesCapturedByPlayer(color: PieceColor): Array<string>
    {
        if (color == PieceColor.WHITE)
        {
            return [];
        }

        if (color == PieceColor.BLACK)
        {
            return [];
        }

        return [];
    }

    //Returns true if white to move, false if black to move.
    public getTurn(): boolean
    {
        return this._inst.turn === 'white';
    }

    private _convertPiece(squareContent: Piece | undefined)
    {
      let pieceCode = "";

      if (squareContent) {
        switch (`${squareContent.color}-${squareContent.role}`) {
          // White pieces
          case "white-pawn":
            pieceCode = PieceType.WHITE_PAWN;
            break;

          case "white-rook":
            pieceCode = PieceType.WHITE_ROOK;
            break;

          case "white-knight":
            pieceCode = PieceType.WHITE_KNIGHT;
            break;

          case "white-bishop":
            pieceCode = PieceType.WHITE_BISHOP;
            break;

          case "white-queen":
            pieceCode = PieceType.WHITE_QUEEN;
            break;

          case "white-king":
            pieceCode = PieceType.WHITE_KING;
            break;

          // Black pieces
          case "black-pawn":
            pieceCode = PieceType.BLACK_PAWN;
            break;

          case "black-rook":
            pieceCode = PieceType.BLACK_ROOK;
            break;

          case "black-knight":
            pieceCode = PieceType.BLACK_KNIGHT;
            break;

          case "black-bishop":
            pieceCode = PieceType.BLACK_BISHOP;
            break;

          case "black-queen":
            pieceCode = PieceType.BLACK_QUEEN;
            break;

          case "black-king":
            pieceCode = PieceType.BLACK_KING;
            break;
        }
      }

      return pieceCode
    }

    //#endregion

    //#region Manipulation of state

    //Set true for white to move, false for black to move.
    public setTurn(val: boolean): void 
    {
        //Turn of the game currently
        const currentTurn = this.getTurn();

        //Don't do the computationally expensive shit if nothing changes.
        if (currentTurn === val)
        {
            return;
        }

        //Get the current fen and split it.
        const currentFen = this.getFEN();
        const parts = currentFen.split(' ');

        //Switch the turn portion.
        parts[1] = val === true ? PieceColor.WHITE : PieceColor.BLACK;

        //Create a new fen by joining it.
        const newFen = parts.join(' ');
        this._instantiateFromFen(newFen);
    }

    //Resets the board to its default.
    public reset(): void
    {
        this._inst = Chess.default();
    }

    //Clears board except the kings.
    public clear(): void 
    {
        this._instantiateFromFen("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
    }

    //Places a piece at a given coord.
    public setPieceOnBoard(coord: string, piece: string): void
    {
        throw new Error("Not implemented.");
    }

    private _instantiateFromFen(fen: string)
    {
        const setup = parseFen(fen).unwrap();
        this._inst = Chess.fromSetup(setup).unwrap();
    }

    //#endregion

    //#region Game state

    //Gets game state object.
    public getGameState(): GameState
    {
        throw new Error("Not implemented.");
    }

    //Triggers game over check from outside if necessary
    public checkIsGameOver(): void
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region Moves

    //Fully validated legal moves that a certain coordinate's piece can make
    public getLegalMoves(coordinate: string): Array<string>
    {
        throw new Error("Not implemented.");
    }

    //Moves a piece from one spot to another and accounting for promotion if applicable.
    public completeMove(fromCoordinate: string, toCoordinate: string, promotionPiece: string): IMoveResult
    {
        throw new Error("Not implemented.");
    }

    //Clears state cache and reverts it completely to that of the previous move.
    public undoMostRecentMove(): void
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region Castling and en passant

    public getCastlingRights(type: CastlingRightsType): boolean
    {
        throw new Error("Not implemented.");
    }

    //Sets the castling rights for one of the four types
    public setCastlingRights(type: CastlingRightsType, val: boolean): void
    {
        throw new Error("Not implemented.");
    }

    //Retrieves the coord of the en passant square
    public getEnPassantSquare(): string 
    {
        throw new Error("Method not implemented.");
    }

    //Sets en passant square to the passed coord.
    public setEnPassantSquare(coord: string): void 
    {
        throw new Error("Method not implemented.");
    }

    //#endregion

    //#region Instantiation

    public clone(): IChessGame
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region FEN
    public getFEN(): string 
    {
        const currentFen = makeFen(this._inst.toSetup());

        return currentFen;
    }

    //#endregion
}