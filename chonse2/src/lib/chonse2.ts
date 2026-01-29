import { PieceColor } from "./piece-color";
import PieceMaterial from "./piece-material";
import { PieceType } from "./piece-type";

export default class Chonse2
{
    static DEFAULT_PIECE_STATE: Array<Array<string>> = 
    [
        [ PieceType.BLACK_ROOK, PieceType.BLACK_KNIGHT, PieceType.BLACK_BISHOP, PieceType.BLACK_QUEEN, PieceType.BLACK_KING, PieceType.BLACK_BISHOP,PieceType.BLACK_KNIGHT, PieceType.BLACK_ROOK],
        [ PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN],
        [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
        [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
        [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
        [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
        [ PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN],
        [ PieceType.WHITE_ROOK, PieceType.WHITE_KNIGHT, PieceType.WHITE_BISHOP, PieceType.WHITE_QUEEN, PieceType.WHITE_KING, PieceType.WHITE_BISHOP, PieceType.WHITE_KNIGHT, PieceType.WHITE_ROOK]
    ];

    
    static COORDS: Array<Array<string>> = 
    [
        ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
        ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
        ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
        ["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
        ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
        ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
        ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
        ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
    ];

    //CONSTANTS
    static WHITE_PAWN_RANK = 2;
    static BLACK_PAWN_RANK = 7;
    static WHITE_PAWN_PROMOTE_RANK = 8;
    static BLACK_PAWN_PROMOTE_RANK = 1;
    static SIZE: number = 8;

    static _BISHOP_VECTOR_X = [-1, -1, 1, 1];
    static _BISHOP_VECTOR_Y = [-1, 1, -1, 1];
    static _ROOK_VECTOR_X = [-1, 1, 0, 0];
    static _ROOK_VECTOR_Y = [0, 0, -1, 1];
    static _QUEEN_VECTOR_X = [-1, 1, 0, 0, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, -1, 1, 1];
    static _QUEEN_VECTOR_Y = [0, 0, -1, 1, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, 1, -1, 1];

    //CAPTURE PROPERTIES
    piecesWhiteCaptured: string[] = [];
    piecesBlackCaptured: string[] = [];
    promotionalMaterialDifference: number = 0;

    //the state of the board
    pieceState: Array<Array<string>>;

    //instantiates with either a passed game state or the default one.
    constructor(passedState: Array<Array<string>> = Chonse2.DEFAULT_PIECE_STATE)
    {
        this.pieceState = passedState;
    }

    getLegalMoves(coordinate: string, piece: string): Array<string>
    {
        let potentiallyLegalMoves: Array<string> = [];

        //handle pawn
        if (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN)
        {
            potentiallyLegalMoves = this._getPotentiallyLegalPawnMoves(coordinate, piece);
        }

        //handle knight
        if (piece == PieceType.WHITE_KNIGHT || piece == PieceType.BLACK_KNIGHT)
        {
            potentiallyLegalMoves = this._getPotentiallyLegalKnightMoves(coordinate, piece);
        }

        //handle bishop
        if (piece == PieceType.WHITE_BISHOP || piece == PieceType.BLACK_BISHOP)
        {
            potentiallyLegalMoves = this._getPotentiallyLegalBishopMoves(coordinate, piece);
        }

        //handle rook
        if (piece == PieceType.WHITE_ROOK || piece == PieceType.BLACK_ROOK)
        {
            potentiallyLegalMoves = this._getPotentiallyLegalRookMoves(coordinate, piece);
        }

        //handle queen
        if (piece == PieceType.WHITE_QUEEN || piece == PieceType.BLACK_QUEEN)
        {
            potentiallyLegalMoves = this._getPotentiallyLegalQueenMoves(coordinate, piece)
        }

        //handle king
        if (piece == PieceType.WHITE_QUEEN || piece == PieceType.BLACK_KING)
        {
            //
        }

        return potentiallyLegalMoves;
    }
    
    _getPotentiallyLegalPawnMoves(coordinate: string, piece: string): Array<string>
    {
        if (piece != PieceType.WHITE_PAWN && piece != PieceType.BLACK_PAWN)
        {
          return [];
        }
        const {rowIndex, colIndex} = this.findIndexFromCoordinate(coordinate);
        const legalMoves:Array<string> = [];
    
        //rank ahead of this one
        const rankAbove = piece == PieceType.WHITE_PAWN ? this.pieceState.at(rowIndex - 1) : this.pieceState.at(rowIndex + 1);
        const rankNumber = Number(coordinate[1]);
    
        //if the rank above this one exists, there might be a legal move
        if (rankAbove)
        {
          const squareInFront = rankAbove.at(colIndex);
    
          //if the square directly in front of it has nothing in it, then it can be moved to.
          if (squareInFront == "")
          {
            piece == PieceType.WHITE_PAWN ? legalMoves.push(Chonse2.COORDS[rowIndex - 1][colIndex]) : legalMoves.push(Chonse2.COORDS[rowIndex + 1][colIndex]);
          }
    
          //if this column is not the leftmost one, then it can potentially capture a piece left-diagonally.
          if (colIndex != 0)
          {
            const leftCaptureSquare = rankAbove.at(colIndex - 1);
    
            if (leftCaptureSquare?.startsWith(piece == PieceType.WHITE_PAWN ? PieceColor.BLACK : PieceColor.WHITE))
            {
              piece == PieceType.WHITE_PAWN ? legalMoves.push(Chonse2.COORDS[rowIndex - 1][colIndex - 1]) : legalMoves.push(Chonse2.COORDS[rowIndex + 1][colIndex - 1]);
            }
          }
    
          //if this column is not the rightmost one, then it can potentially capture a piece right-diagonally.
          if (colIndex != rankAbove.length - 1)
          {
            const rightCaptureSquare = rankAbove.at(colIndex + 1);
    
            if (rightCaptureSquare?.startsWith(piece == PieceType.WHITE_PAWN ? PieceColor.BLACK : PieceColor.WHITE))
            {
              piece == PieceType.WHITE_PAWN ? legalMoves.push(Chonse2.COORDS[rowIndex - 1][colIndex + 1]) : legalMoves.push(Chonse2.COORDS[rowIndex + 1][colIndex + 1]);;
            }
          }
    
          if (piece == PieceType.WHITE_PAWN ? rankNumber == Chonse2.WHITE_PAWN_RANK : rankNumber === Chonse2.BLACK_PAWN_RANK)
          {
            //two ranks ahead of where the pawn is.
            const twoRanksAbove = piece == PieceType.WHITE_PAWN ? this.pieceState.at(rowIndex - 2) : this.pieceState.at(rowIndex + 2);
    
            //the two squares above it can potentially be legal moves.
            if (twoRanksAbove)
            {
              const twoSquaresAbove = twoRanksAbove.at(colIndex);
    
              //two squares up is only legal if one square up is.
              if (twoSquaresAbove == "")
              {
                piece == PieceType.WHITE_PAWN ? legalMoves.push(Chonse2.COORDS[rowIndex - 2][colIndex]) : legalMoves.push(Chonse2.COORDS[rowIndex + 2][colIndex]);;
              }
            }
          }
        }
        return legalMoves;
    }
    
    _getPotentiallyLegalKnightMoves(coordinate: string, piece: string) : Array<string>
    {
        if (piece != PieceType.WHITE_KNIGHT && piece != PieceType.BLACK_KNIGHT)
        {
          return [];
        }
    
        const {rowIndex, colIndex} = this.findIndexFromCoordinate(coordinate);
        const legalMoves: Array<string> = [];
    
        //A knight can only move two ahead and one to the side. These are the offsets for the eight possible squares a knight can go to relative to its current position
        const dRow: Array<number> = [2, 1, 2, 1, -1, -2, -1, -2];
        const dCol: Array<number> = [-1, -2, +1, +2, -2, -1, +2, +1];
    
        //Loop over each of the potential differences.
        for(let i = 0; i < dRow.length; i++)
        {
          //The rank that the knight will move to.
          const rankInQuestion = this.pieceState[rowIndex + dRow[i]];      
    
          //If the rank does in fact exist, find its square.
          if (rankInQuestion)
          {
            //The square that might be able to be moved to.
            const potentialMoveSquare = rankInQuestion[colIndex + dCol[i]];
    
            //It can also be undefined if the offset exists outside the board, check for this.
            if (potentialMoveSquare != undefined)
            {
              //Two cases: Either there's nothing there and the knight can move there, or there is a piece of the opposite color that can be captured.
              if (
                (piece == PieceType.WHITE_KNIGHT ? potentialMoveSquare.startsWith(PieceColor.BLACK) : potentialMoveSquare.startsWith(PieceColor.WHITE)) 
                || potentialMoveSquare == "")
              {
                //Legal move in either case is the current square with the 2 straight/1 side offset applied.
                legalMoves.push(Chonse2.COORDS[rowIndex + dRow[i]][colIndex + dCol[i]]);
              }
            }
          }
    
        }
    
        
    
        return legalMoves;
    }
      
    _getPotentiallyLegalBishopMoves(coordinate: string, piece: string): Array<string>
    {
        if (piece != PieceType.WHITE_BISHOP && piece != PieceType.BLACK_BISHOP)
        {
          return [];
        }
    
        return this._getVectorMoves(coordinate, piece, Chonse2._BISHOP_VECTOR_X, Chonse2._BISHOP_VECTOR_Y);
    }
    
    _getPotentiallyLegalRookMoves(coordinate: string, piece: string): Array<string>
    {
        if (piece != PieceType.WHITE_ROOK && piece != PieceType.BLACK_ROOK)
        {
          return [];
        }
    
        return this._getVectorMoves(coordinate, piece, Chonse2._ROOK_VECTOR_X, Chonse2._ROOK_VECTOR_Y);
    }
    
    _getPotentiallyLegalQueenMoves(coordinate: string, piece: string) : Array<string>
    {
        if (piece != PieceType.WHITE_QUEEN && piece != PieceType.BLACK_QUEEN)
        {
          return [];
        }
    
        return this._getVectorMoves(coordinate, piece, Chonse2._QUEEN_VECTOR_X, Chonse2._QUEEN_VECTOR_Y);
    }
    
    _getPotentiallyLegalKingMoves(coordinate: string, piece: string): Array<string>
    {
        if (piece != PieceType.WHITE_KING && piece != PieceType.BLACK_KING)
        {
          return [];
        }
    
        const {rowIndex, colIndex} = this.findIndexFromCoordinate(coordinate);
        const legalMoves: Array<string> = [];
    
        return legalMoves;
    }
    
    _getVectorMoves(coordinate: string, piece: string, vectorX: Array<number>, vectorY: Array<number>): Array<string>
    {
        const {rowIndex, colIndex} = this.findIndexFromCoordinate(coordinate);
        const legalMoves: Array<string> = [];
    
        //Loop through each of the vectors x and y components
        for(let offsetIndex = 0; offsetIndex < vectorX.length; offsetIndex++)
        {
          //The current directions.
          let dx = vectorX[offsetIndex];
          let dy = vectorY[offsetIndex];
    
          //Ensures that the loop does not run longer than necessary (ie, not exceeding the board size).
          let runCount = 0;
    
          for(
            //set the offsets to their starting values and repeatedly adding that value in each direction until the end is reached.
            let currentXOffset = dx, currentYOffset = dy; 
            runCount < Chonse2.SIZE;  
            currentXOffset += dx, currentYOffset += dy, runCount ++)
            {
              //row of the square the bishop will move to.
              const rowInQuestion = this.pieceState[rowIndex + currentXOffset];
    
              //if it indeed exists within the board, get the square.
              if (rowInQuestion)
              {
                const potentialMoveSquare = rowInQuestion[colIndex + currentYOffset];
    
                //If the square exists, there are three cases:
                if (potentialMoveSquare != undefined)
                {
                  //If there is a piece in that square and it is an opposite colored piece, add it to the list of legal moves and break out (cannot go through pieces).
                  if (piece.startsWith(PieceColor.WHITE) ? potentialMoveSquare.startsWith(PieceColor.BLACK) : potentialMoveSquare.startsWith(PieceColor.WHITE))
                  {
                    legalMoves.push(Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset]);
                    break;
                  }
    
                  //If the square is empty, that is a legal move, and the one after it could be.
                  if (potentialMoveSquare == "")
                  {
                    legalMoves.push(Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset]);
                  }
    
                  //If the square has an ally piece, that can't be a legal move, nor can anything after it. 
                  if (piece.startsWith(PieceColor.WHITE) ? potentialMoveSquare.startsWith(PieceColor.WHITE) : potentialMoveSquare.startsWith(PieceColor.BLACK))
                  {
                    break;
                  }
                }
              }
            }
        }
        return legalMoves;
    }
    
    completeMove(fromCoordinate: string, toCordinate: string, piece: string, promotionPiece = PieceType.QUEEN): boolean
    {
        const legalMoves = this.getLegalMoves(fromCoordinate, piece); 

        if (!legalMoves.includes(toCordinate))
        {
            return false;
        }

        //In piece state, where the current piece is moving to.
        const toSquareIndex = this.findIndexFromCoordinate(toCordinate);
    
        //In the piece state, where the current piece is moving from.
        const fromSquareIndex = this.findIndexFromCoordinate(fromCoordinate);
    
        //The piece already present in the square the current piece is moving to (being captured)
        const pieceInToSquare = this.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex];
    
        //handle capture
        if (pieceInToSquare != "")
        {
          //if there was already a piece in the TO square, and the current piece is a black one, then black must be capturing a white piece.
          if (piece.startsWith(PieceColor.BLACK))
          {
            this.piecesBlackCaptured.push(pieceInToSquare);
          }
          
          //vice versa
          if (piece.startsWith(PieceColor.WHITE))
          {
            this.piecesWhiteCaptured.push(pieceInToSquare);
          }
        }
    
        //Handle promotion
        if (
          piece == PieceType.WHITE_PAWN && toCordinate.includes(Chonse2.WHITE_PAWN_PROMOTE_RANK.toString()) ||
          piece == PieceType.BLACK_PAWN && toCordinate.includes(Chonse2.BLACK_PAWN_PROMOTE_RANK.toString()))
        {

            switch(promotionPiece)
            {
                case PieceType.QUEEN:
                    piece = (piece == PieceType.WHITE_PAWN) ? PieceType.WHITE_QUEEN : PieceType.BLACK_QUEEN;
                    break;

                case PieceType.ROOK:
                    piece = (piece == PieceType.WHITE_PAWN) ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;
                    break;

                case PieceType.BISHOP:
                    piece = (piece == PieceType.WHITE_PAWN) ? PieceType.WHITE_BISHOP : PieceType.BLACK_BISHOP;
                    break;
                
                case PieceType.KNIGHT:
                    piece = (piece == PieceType.WHITE_PAWN) ? PieceType.WHITE_KNIGHT : PieceType.BLACK_KNIGHT;
                    break;
            }

            //Change the piece for the promoted one and update material difference.
            if (piece.startsWith(PieceColor.WHITE))
            {
                this.promotionalMaterialDifference += PieceMaterial.getMaterialFromPiece(piece) - 1; //+1 accounts for the loss of pawn.
            }
            else
            {
                this.promotionalMaterialDifference -= PieceMaterial.getMaterialFromPiece(piece) + 1;
            }
            
            //set promoted piece
            this.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;
        
        }
        
        //Clear the old piece position.
        this.pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex] = "";
    
        //Replace it in the new position.
        this.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;
        
        //The move was successful if we got this far.
        return true;
    }
    
    findIndexFromCoordinate(coordinate: string) : { rowIndex: number, colIndex: number }
    {
        //Finds the row that includes this coordinate.
        const rIdx = Chonse2.COORDS.findIndex( row => row.includes(coordinate) );

        //If it doesn't exist, it should return -1.
        if (rIdx === -1)
        {
            return { rowIndex: -1, colIndex: -1 };
        }

        //The column index is the place in the rank where that exact coordinate is found.
        const cIdx = Chonse2.COORDS[rIdx].findIndex( col => col === coordinate );

        //Both row and column indeces are returned.
        return {rowIndex: rIdx, colIndex: cIdx};
    }
    
    //Positive number signifies that white is up, negative signifies black is up.
    getMaterialAdvantage()
    {
        let whiteMaterialCaptured: number = 0;
        let blackMaterialCaptured: number = 0;
    
        this.piecesWhiteCaptured.forEach( piece =>
        {
          whiteMaterialCaptured += PieceMaterial.getMaterialFromPiece(piece);
        })
    
        this.piecesBlackCaptured.forEach(piece =>
        {
          blackMaterialCaptured += PieceMaterial.getMaterialFromPiece(piece);
        })
    
        return whiteMaterialCaptured - blackMaterialCaptured + this.promotionalMaterialDifference;
    }
}