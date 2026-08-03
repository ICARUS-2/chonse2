import { CastlingRightsType } from "../../../libs/chess-game-lib/types/castling-rights-type";
import { ChessConstants } from "../../../libs/chess-game-lib/types/constants";
import { PieceColor } from "../../../libs/chess-game-lib/types/piece-color";
import { PieceType } from "../../../libs/chess-game-lib/types/piece-type";

export default class EditorState
{
  //Piece and board state.
  private _pieceState: Array<Array<string>>;

  //True: White's turn, false: black's turn
  private _turn: boolean = true; 
    
  //Castling
  private _whiteCastlingRights: EditorCastlingRights;
  private _blackCastlingRights: EditorCastlingRights;

  //En passant
  private _enPassantSquare: string = "";

  //Move counters
  private _halfMovesWithoutPawnMovementsOrCaptures: number = 0;
  private _fullMoveCounter: number = 1;

  //Previous state cache for efficiently (compared to my previous shitty implementation that created a bunch of objects) undoing the last move.
  private _stateCache: PreviousStateCache;

  //Instantiates with either a passed game state or the default one.
  constructor()
  {
    this._pieceState = ChessConstants.DEFAULT_PIECE_STATE.map(rank => [...rank])

    //Initialize castling rights
    this._whiteCastlingRights = new EditorCastlingRights();
    this._blackCastlingRights = new EditorCastlingRights();

    //Initialize state cache
    this._stateCache = new PreviousStateCache();
  }

  //#region Pieces + squares.
  //Gets the row and column indeces when a rank and file coordinate are passed in.
  public getPieceState(): string[][]
  {
    return this._pieceState.map(row => [...row]);
  }

  //Gets the coordinate of the passed color's king
  public getKingCoordinate(kingColor: string): string
  {
    if (kingColor != PieceColor.BLACK && kingColor != PieceColor.WHITE)
    {
      return "";
    }

    const rIdx = this._pieceState.findIndex( row => row.includes( (kingColor == PieceColor.WHITE ? PieceType.WHITE_KING : PieceType.BLACK_KING) ) )
    
    if (rIdx == -1)
    {
      return "";
    }

    const cIdx = this._pieceState[rIdx].findIndex( p => p === (kingColor == PieceColor.WHITE ? PieceType.WHITE_KING : PieceType.BLACK_KING))
  
    return ChessConstants.COORDS[rIdx][cIdx];
  }

  //Verifies if a king of a particular color is in check.
  public isInCheck(kingColor: string): boolean
  {
    //If the color isn't valid, don't bother checking for checks (haha get it)
    if (kingColor != PieceColor.BLACK && kingColor != PieceColor.WHITE)
    {
      return false;
    }

    //The coordinate of the current color king
    const kingCoordinate: string = this.getKingCoordinate(kingColor);

    return this._isSquareAttacked(kingCoordinate, PieceColor.getOpposite(kingColor))
  }

  //Places a piece on the board at any coord.
  public setPieceOnBoard(coord: string, piece: string): void
  {
    const { rowIndex, colIndex } = ChessConstants.findIndexFromCoordinate(coord);
    
    if (rowIndex >= 0 && colIndex >= 0)
    {
      this._pieceState[rowIndex][colIndex] = piece;
    }
  }

  //Resets the board to its default.
  public reset(): void
  {
    //Reset piece state.
    this._pieceState = ChessConstants.DEFAULT_PIECE_STATE.map(rank => [...rank]);
    this._reinitializeInternal();
  }

  //Clears board except the kings.
  public clear(): void 
  {
    this._pieceState = ChessConstants.CLEARED_BOARD.map(rank => [...rank]);
    this._reinitializeInternal();
  }

  //Returns true if white to move, false if black to move.
  public getTurn(): boolean
  {
    return this._turn;
  }

  //Set true for white to move, false for black to move.
  public setTurn(val: boolean)
  {
    this._turn = val;
  }

  //Reinitializes all the properties.
  private _reinitializeInternal()
  {
    //Reset castling rights
    this._whiteCastlingRights.kingSide = true;
    this._whiteCastlingRights.queenSide = true;
    this._blackCastlingRights.kingSide = true;
    this._blackCastlingRights.queenSide = true;
    
    //Reset en passant.
    this._enPassantSquare = "";

    //Reset position map
    this._stateCache = new PreviousStateCache();
  }

  //Checks if any piece of the passed color can attack the passed square.
  private _isSquareAttacked(coord: string, attackerColor: string): boolean 
  {
    if (attackerColor != PieceColor.WHITE && attackerColor != PieceColor.BLACK)
    {
      return false;
    }

    const {rowIndex, colIndex} = ChessConstants.findIndexFromCoordinate(coord);

    //The legal moves of the given piece types in this position.
    const rookMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), ChessConstants.ROOK_VECTOR_X, ChessConstants.ROOK_VECTOR_Y);
    const queenMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), ChessConstants.QUEEN_KING_VECTOR_X, ChessConstants.QUEEN_KING_VECTOR_Y);
    const kingMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), ChessConstants.QUEEN_KING_VECTOR_X, ChessConstants.QUEEN_KING_VECTOR_Y, 1);
    const bishopMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), ChessConstants.BISHOP_VECTOR_X, ChessConstants.BISHOP_VECTOR_Y);
    const knightMoves = this._getPotentiallyLegalKnightMoves(coord, PieceColor.getOpposite(attackerColor));

    //Check if a rook can attack the square
    const rookPiece = attackerColor + PieceType.ROOK;
    for(let seenSquare of rookMoves)
    {
      const seenSquareIndex = ChessConstants.findIndexFromCoordinate(seenSquare);
      if (this._pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == rookPiece)
      {
        return true;
      }
    }

    //Check if a queen can attack the square.
    const queenPiece = attackerColor + PieceType.QUEEN;
    for(let seenSquare of queenMoves)
    {
      const seenSquareIndex = ChessConstants.findIndexFromCoordinate(seenSquare);
      if (this._pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == queenPiece)
      {
        return true;
      }
    }

    //Check if a king can attack the square.
    const kingPiece = attackerColor + PieceType.KING;
    for(let seenSquare of kingMoves)
    {
      const seenSquareIndex = ChessConstants.findIndexFromCoordinate(seenSquare);
      if (this._pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == kingPiece)
      {
        return true;
      }
    }

    //Check if a bishop can attack the square.
    const bishopPiece = attackerColor + PieceType.BISHOP;
    for(let seenSquare of bishopMoves)
    {
      const seenSquareIndex = ChessConstants.findIndexFromCoordinate(seenSquare);
      if (this._pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == bishopPiece)
      {
        return true;
      }
    }

    //Check if a knight can see the square.
    const knightPiece = attackerColor + PieceType.KNIGHT;
    for(let seenSquare of knightMoves)
    {
      const seenSquareIndex = ChessConstants.findIndexFromCoordinate(seenSquare);
      if (this._pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == knightPiece)
      {
        return true;
      }
    }

    //Check if there's a pawn that can strike diagonally
    const pawnPiece = attackerColor + PieceType.PAWN;
    const rankAbove = attackerColor == PieceColor.BLACK ? this._pieceState[rowIndex - 1] : this._pieceState[rowIndex + 1];
    if (rankAbove)
    {
      const leftPotentialPawnSquare = rankAbove[colIndex - 1];
      const rightPotentialPawnSquare = rankAbove[colIndex + 1];

      if (leftPotentialPawnSquare)
      {
        if (leftPotentialPawnSquare == pawnPiece)
        {
          return true;
        }
      }

      if (rightPotentialPawnSquare)
      {
        if (rightPotentialPawnSquare == pawnPiece)
        {
          return true;
        }
      }
    }

    return false;
  }
  //#endregion

  //#region Game state.
  //Stores the most recent move so it can be undone.
  private _cacheState()
  {
    //Turn
    this._stateCache.turn = this._turn;

    //Piece state
    for(let rank = 0; rank < this._pieceState.length; rank++)
    {
      for(let file = 0; file < this._pieceState.length; file++)
      {
        this._stateCache.pieceState[rank][file] = this._pieceState[rank][file];
      }
    }

    //Castling rights
    this._stateCache.whiteKingsideCastlingRights = this._whiteCastlingRights.kingSide;
    this._stateCache.whiteQueensideCastlingRights = this._whiteCastlingRights.queenSide;
    this._stateCache.blackKingsideCastlingRights = this._blackCastlingRights.kingSide;
    this._stateCache.blackQueensideCastlingRights = this._blackCastlingRights.queenSide;

    //Move counters
    this._stateCache.halfMovesWithoutPawnMovementsOrCaptures = this._halfMovesWithoutPawnMovementsOrCaptures;
    this._stateCache.fullMoveCounter = this._fullMoveCounter;

    //Previous fen key
    this._stateCache._previousStateMap.clear();
  }

  //#endregion

  //#region Moves

  //Fully validated legal moves that a certain coordinate's piece can make
  public getLegalMoves(coordinate: string): Array<string>
  {
    //Where the piece is within the state.
    const index = ChessConstants.findIndexFromCoordinate(coordinate);

    //The piece that is being moved.
    const piece = this._pieceState[index.rowIndex][index.colIndex];

    if (piece == ""
      || (piece.startsWith(PieceColor.WHITE) && !this._turn)
      || (piece.startsWith(PieceColor.BLACK) && this._turn)
    )
    {
      return [];
    }

    //The moves disregarding checks.
    const potentiallyLegalMoves = this._getPotentiallyLegalMoves(coordinate);

    //Clone the object once.
    const deepCopy: EditorState = this.clone();

    //Out of the available potential legal moves, use dummy moves to see if the player would be in check after. If so, it is not a legal move.
    const legalMoves = potentiallyLegalMoves.filter(item =>
      {
        //Test the dummy move using a stripped-down version
        EditorState._playDummyMove(deepCopy, coordinate, item);

        //Return true if the player was not in check after the legal move, false if the move would put them in check
        const isKingSafe = this._turn ? !deepCopy.isInCheck(PieceColor.WHITE) : !deepCopy.isInCheck(PieceColor.BLACK);
      
        //Undo the move so that this object can be reused to check the legality of the next
        deepCopy.undoMostRecentMove();

        return isKingSafe;
      }
    )

    return legalMoves;
  }

  //Clears state cache and reverts it completely to that of the previous move.
  public undoMostRecentMove()
  {
    //Turn
    this._turn = this._stateCache.turn;

    //piece state
    for(let rank = 0; rank < this._stateCache.pieceState.length; rank++)
    {
      for(let file = 0; file < this._stateCache.pieceState.length; file++)
      {
        this._pieceState[rank][file] = this._stateCache.pieceState[rank][file];
      }
    }

    //Castling rights
    this._whiteCastlingRights.kingSide = this._stateCache.whiteKingsideCastlingRights;
    this._whiteCastlingRights.queenSide = this._stateCache.whiteQueensideCastlingRights;
    this._blackCastlingRights.kingSide = this._stateCache.blackKingsideCastlingRights;
    this._blackCastlingRights.queenSide = this._stateCache.blackQueensideCastlingRights;

    //Move counters
    this._halfMovesWithoutPawnMovementsOrCaptures = this._stateCache.halfMovesWithoutPawnMovementsOrCaptures;
    this._fullMoveCounter = this._stateCache.fullMoveCounter;
  }

  //Pseudolegal moves (not validated).
  private _getPotentiallyLegalMoves(coordinate: string): Array<string>
  {
    const index = ChessConstants.findIndexFromCoordinate(coordinate);
    const piece = this._pieceState[index.rowIndex][index.colIndex];
    let potentiallyLegalMoves: Array<string> = [];

    //handle pawn
    if (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN)
    {
        potentiallyLegalMoves = this._getPotentiallyLegalPawnMoves(coordinate, piece[0]);
    }

    //handle knight
    if (piece == PieceType.WHITE_KNIGHT || piece == PieceType.BLACK_KNIGHT)
    {
        potentiallyLegalMoves = this._getPotentiallyLegalKnightMoves(coordinate, piece[0]);
    }

    //handle bishop
    if (piece == PieceType.WHITE_BISHOP || piece == PieceType.BLACK_BISHOP)
    {
        potentiallyLegalMoves = this._getPotentiallyLegalBishopMoves(coordinate, piece[0]);
    }

    //handle rook
    if (piece == PieceType.WHITE_ROOK || piece == PieceType.BLACK_ROOK)
    {
        potentiallyLegalMoves = this._getPotentiallyLegalRookMoves(coordinate, piece[0]);
    }

    //handle queen
    if (piece == PieceType.WHITE_QUEEN || piece == PieceType.BLACK_QUEEN)
    {
        potentiallyLegalMoves = this._getPotentiallyLegalQueenMoves(coordinate, piece[0])
    }

    //handle king
    if (piece == PieceType.WHITE_KING || piece == PieceType.BLACK_KING)
    {
        potentiallyLegalMoves = this._getPotentiallyLegalKingMoves(coordinate, piece[0])
    }

    return potentiallyLegalMoves;
  }
  
  //Pawn pseudolegal moves (not validated)
  private _getPotentiallyLegalPawnMoves(coordinate: string, color: string): Array<string>
  {
    const {rowIndex, colIndex} = ChessConstants.findIndexFromCoordinate(coordinate);
    const legalMoves:Array<string> = [];

    //rank ahead of this one
    const rankAbove = color == PieceColor.WHITE ? this._pieceState.at(rowIndex - 1) : this._pieceState.at(rowIndex + 1);
    const rankNumber = Number(coordinate[1]);

    //if the rank above this one exists, there might be a legal move
    if (rankAbove)
    {
      const squareInFront = rankAbove.at(colIndex);

      //if the square directly in front of it has nothing in it, then it can be moved to.
      if (squareInFront == "")
      {
        color == PieceColor.WHITE ? legalMoves.push(ChessConstants.COORDS[rowIndex - 1][colIndex]) : legalMoves.push(ChessConstants.COORDS[rowIndex + 1][colIndex]);
      }

      //if this column is not the leftmost one, then it can potentially capture a piece left-diagonally.
      if (colIndex != 0)
      {
        //The piece content of the left capture square.
        const leftCaptureSquare = rankAbove.at(colIndex - 1);

        //The coordinate of the above square.
        const leftCaptureSquareCoord = color == PieceColor.WHITE ? ChessConstants.COORDS[rowIndex - 1][colIndex - 1] : ChessConstants.COORDS[rowIndex + 1][colIndex - 1];

        //The square is a legal move if it has an opposing piece OR it is the en passant square
        if (leftCaptureSquare?.startsWith(color == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE) 
          || leftCaptureSquareCoord == this._enPassantSquare)
        {
          legalMoves.push(leftCaptureSquareCoord);
        }
      }

      //if this column is not the rightmost one, then it can potentially capture a piece right-diagonally.
      if (colIndex != rankAbove.length - 1)
      {
        //The piece content of the right capture square.
        const rightCaptureSquare = rankAbove.at(colIndex + 1);

        //The coordinate of the above square.
        const rightCaptureSquareCoord = color == PieceColor.WHITE ? ChessConstants.COORDS[rowIndex - 1][colIndex + 1] : ChessConstants.COORDS[rowIndex + 1][colIndex + 1]

        //The square is a legal move if it has an opposing piece OR it is the en passant square
        if (rightCaptureSquare?.startsWith(color == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE)
          || rightCaptureSquareCoord == this._enPassantSquare)
        {
          legalMoves.push(rightCaptureSquareCoord);
        }
      }

      if (color == PieceColor.WHITE ? rankNumber == ChessConstants.WHITE_PAWN_RANK : rankNumber === ChessConstants.BLACK_PAWN_RANK)
      {
        //two ranks ahead of where the pawn is.
        const twoRanksAbove = color == PieceColor.WHITE ? this._pieceState.at(rowIndex - 2) : this._pieceState.at(rowIndex + 2);

        //the two squares above it can potentially be legal moves.
        if (twoRanksAbove)
        {
          const twoSquaresAbove = twoRanksAbove.at(colIndex);

          //two squares up is only legal if one square up is.
          if (twoSquaresAbove == "" && squareInFront == "")
          {
            color == PieceColor.WHITE ? legalMoves.push(ChessConstants.COORDS[rowIndex - 2][colIndex]) : legalMoves.push(ChessConstants.COORDS[rowIndex + 2][colIndex]);;
          }
        }
      }
    }
    return legalMoves;
  }
  
  //Knight pseudolegal moves (not validated)
  private _getPotentiallyLegalKnightMoves(coordinate: string, color: string) : Array<string>
  {
    const {rowIndex, colIndex} = ChessConstants.findIndexFromCoordinate(coordinate);
    const legalMoves: Array<string> = [];

    //A knight can only move two ahead and one to the side. These are the offsets for the eight possible squares a knight can go to relative to its current position
    const dRow: Array<number> = [2, 1, 2, 1, -1, -2, -1, -2];
    const dCol: Array<number> = [-1, -2, +1, +2, -2, -1, +2, +1];

    //Loop over each of the potential differences.
    for(let i = 0; i < dRow.length; i++)
    {
      //The rank that the knight will move to.
      const rankInQuestion = this._pieceState[rowIndex + dRow[i]];      

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
            (color == PieceColor.WHITE ? potentialMoveSquare.startsWith(PieceColor.BLACK) : potentialMoveSquare.startsWith(PieceColor.WHITE)) 
            || potentialMoveSquare == "")
          {
            //Legal move in either case is the current square with the 2 straight/1 side offset applied.
            legalMoves.push(ChessConstants.COORDS[rowIndex + dRow[i]][colIndex + dCol[i]]);
          }
        }
      }

    }

    

    return legalMoves;
  }
    
  //Bishop pseudolegal moves (not validated)
  private _getPotentiallyLegalBishopMoves(coordinate: string, color: string): Array<string>
  {
    return this._getVectorMoves(coordinate, color, ChessConstants.BISHOP_VECTOR_X, ChessConstants.BISHOP_VECTOR_Y);
  }
  
  //Rook pseudolegal moves (not validated)
  private _getPotentiallyLegalRookMoves(coordinate: string, color: string): Array<string>
  {
    return this._getVectorMoves(coordinate, color, ChessConstants.ROOK_VECTOR_X, ChessConstants.ROOK_VECTOR_Y);
  }
  
  //Queen pseudolegal moves (not validated)
  private _getPotentiallyLegalQueenMoves(coordinate: string, color: string) : Array<string>
  {
    return this._getVectorMoves(coordinate, color, ChessConstants.QUEEN_KING_VECTOR_X, ChessConstants.QUEEN_KING_VECTOR_Y);
  }
  
  //King pseudolegal moves (not validated)
  private _getPotentiallyLegalKingMoves(coordinate: string, color: string): Array<string>
  {
    //Base moves.
    let legalMoves = this._getVectorMoves(coordinate, color, ChessConstants.QUEEN_KING_VECTOR_X, ChessConstants.QUEEN_KING_VECTOR_Y, 1);

    //King cannot castle while in check
    if (!this.isInCheck(color))
    {
      //Kingside castling moves. Ensures the player possesses castling rights before checking for their legal moves.
      if (this._turn == true ? this._whiteCastlingRights.kingSide : this._blackCastlingRights.kingSide)
      {
        //These two squares need to be free in order to castle kingside.
        const kingsideKnightSquare = ChessConstants.findIndexFromCoordinate(this._turn == true ? ChessConstants.WHITE_KINGSIDE_KNIGHT_SQUARE : ChessConstants.BLACK_KINGSIDE_KNIGHT_SQUARE);
        const kingsideBishopSquare = ChessConstants.findIndexFromCoordinate(this._turn == true ? ChessConstants.WHITE_KINGSIDE_BISHOP_SQUARE : ChessConstants.BLACK_KINGSIDE_BISHOP_SQUARE);
        const kingSquare = this._turn == true ? ChessConstants.WHITE_KING_SQUARE : ChessConstants.BLACK_KING_SQUARE;

        //Check if they're clear and that the king is not castling through an attacked square, and if so, push the castling square as a legal move.
        if (
          this._pieceState[kingsideKnightSquare.rowIndex][kingsideKnightSquare.colIndex] == ""
          && this._pieceState[kingsideBishopSquare.rowIndex][kingsideBishopSquare.colIndex] == "" 
          && !this._isSquareAttacked( (color == PieceColor.WHITE ? ChessConstants.WHITE_KINGSIDE_BISHOP_SQUARE : ChessConstants.BLACK_KINGSIDE_BISHOP_SQUARE), PieceColor.getOpposite(color) )
          && coordinate == kingSquare
        )
        {
          this._turn == true ? legalMoves.push(ChessConstants.WHITE_KINGSIDE_KNIGHT_SQUARE) : legalMoves.push(ChessConstants.BLACK_KINGSIDE_KNIGHT_SQUARE);
        }
      }

      //Queenside castling moves. Ensures the player possesses castling rights before checking for their legal moves.
      if (this._turn == true ? this._whiteCastlingRights.queenSide : this._blackCastlingRights.queenSide)
      {
        //These three squares need to be free in order to castle queenside.
        const queensideKnightSquare = ChessConstants.findIndexFromCoordinate(this._turn == true ? ChessConstants.WHITE_QUEENSIDE_KNIGHT_SQUARE : ChessConstants.BLACK_QUEENSIDE_KNIGHT_SQUARE);
        const queensideBishopSquare = ChessConstants.findIndexFromCoordinate(this._turn == true ? ChessConstants.WHITE_QUEENSIDE_BISHOP_SQUARE : ChessConstants.BLACK_QUEENSIDE_BISHOP_SQUARE);
        const queenSquare = ChessConstants.findIndexFromCoordinate(this._turn == true ? ChessConstants.WHITE_QUEEN_SQUARE : ChessConstants.BLACK_QUEEN_SQUARE);
        const kingSquare = this._turn == true ? ChessConstants.WHITE_KING_SQUARE : ChessConstants.BLACK_KING_SQUARE;

        //Check if they're clear and that the king is not castling through an attacked square, and if so, push the castling square as a legal move.
        if (
          this._pieceState[queensideKnightSquare.rowIndex][queensideKnightSquare.colIndex] == ""
          && this._pieceState[queensideBishopSquare.rowIndex][queensideBishopSquare.colIndex] == ""
          && this._pieceState[queenSquare.rowIndex][queenSquare.colIndex] == ""
          && !this._isSquareAttacked(  (color == PieceColor.WHITE ? ChessConstants.WHITE_QUEEN_SQUARE : ChessConstants.BLACK_QUEEN_SQUARE), PieceColor.getOpposite(color)  )
          && coordinate == kingSquare
        )
        {
          this._turn == true ? legalMoves.push(ChessConstants.WHITE_QUEENSIDE_BISHOP_SQUARE) : legalMoves.push(ChessConstants.BLACK_QUEENSIDE_BISHOP_SQUARE);
        }
      }
    }

    return legalMoves;   
  }
  
  //Generates moves for vector-moving pieces (any sliding one)
  private _getVectorMoves(coordinate: string, color: string, vectorX: Array<number>, vectorY: Array<number>, distance = ChessConstants.SIZE): Array<string>
  {
    const {rowIndex, colIndex} = ChessConstants.findIndexFromCoordinate(coordinate);
    //Extract the piece from the square that is being moved from.
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
          runCount < distance;  
          currentXOffset += dx, currentYOffset += dy, runCount ++)
          {
            //row of the square the bishop will move to.
            const rowInQuestion = this._pieceState[rowIndex + currentXOffset];
  
            //if it indeed exists within the board, get the square.
            if (rowInQuestion)
            {
              const potentialMoveSquare = rowInQuestion[colIndex + currentYOffset];
  
              //If the square exists, there are three cases:
              if (potentialMoveSquare != undefined)
              {
                //If there is a piece in that square and it is an opposite colored piece, add it to the list of legal moves and break out (cannot go through pieces).
                if (color == PieceColor.WHITE ? potentialMoveSquare.startsWith(PieceColor.BLACK) : potentialMoveSquare.startsWith(PieceColor.WHITE))
                {
                  legalMoves.push(ChessConstants.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset]);
                  break;
                }
  
                //If the square is empty, that is a legal move, and the one after it could be.
                if (potentialMoveSquare == "")
                {
                  legalMoves.push(ChessConstants.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset]);
                }
  
                //If the square has an ally piece, that can't be a legal move, nor can anything after it. 
                if (color == PieceColor.WHITE ? potentialMoveSquare.startsWith(PieceColor.WHITE) : potentialMoveSquare.startsWith(PieceColor.BLACK))
                {
                  break;
                }
              }
            }
          }
      }
      return legalMoves;
  }

  //Boolean checks if the passed player has any legal moves.
  private _playerHasLegalMoves(turn: boolean): boolean
  {
    const color: string = turn ? PieceColor.WHITE : PieceColor.BLACK;
    const pieceCoords: Array<string> = [];
    const legalMoves: Array<string> = [];
    
    //Loop through each of these to get the coordinates of the pieces.
    for(let i = 0; i < ChessConstants.COORDS.length; i++)
    {
      for(let j = 0; j < ChessConstants.COORDS[i].length; j++)
      {
        const piece = this._pieceState[i][j];

        if ( piece.startsWith(color))
        {
          pieceCoords.push(ChessConstants.COORDS[i][j]);
        }
      }
    }

    pieceCoords.forEach( pieceCoord =>
    {
      const result = this.getLegalMoves(pieceCoord)
      legalMoves.push(...result);
    }
    )

    return legalMoves.length != 0;
  }

  //Dummy move which is used for check verification (to make sure someone isn't putting themselves in check).
  private static _playDummyMove(inst: EditorState, fromCoordinate: string, toCoordinate: string)
  {
    //Caching the state so that the move can be undone
    inst._cacheState();

    //In piece state, where the current piece is moving to.
    const toSquareIndex = ChessConstants.findIndexFromCoordinate(toCoordinate);

    //In the piece state, where the current piece is moving from.
    const fromSquareIndex = ChessConstants.findIndexFromCoordinate(fromCoordinate);

    //Extract the piece from the square that is being moved from.
    let piece = inst._pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex];

    //Handle en passant
    if (toCoordinate == inst._enPassantSquare && (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN))
    {
      //Remove the pawn that just got en passant'd
      inst._turn ? inst._pieceState[toSquareIndex.rowIndex+1][toSquareIndex.colIndex] = "" : inst._pieceState[toSquareIndex.rowIndex-1][toSquareIndex.colIndex] = ""; 
    }
    
    //Clear the old piece position.
    inst._pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex] = "";

    //Replace it in the new position.
    inst._pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;

    //If the player castled kingside (check that the from and to coordinates match a kingside castle).
    if (inst._turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == ChessConstants.WHITE_KING_SQUARE && toCoordinate == ChessConstants.WHITE_KINGSIDE_KNIGHT_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == ChessConstants.BLACK_KING_SQUARE && toCoordinate == ChessConstants.BLACK_KINGSIDE_KNIGHT_SQUARE))
    {
      //If they do, check that they actually have castling rights for the king side.
      if (piece == PieceType.WHITE_KING ? inst._whiteCastlingRights.kingSide : inst._blackCastlingRights.kingSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_KINGSIDE_BISHOP_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_KINGSIDE_BISHOP_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_KINGSIDE_ROOK_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_KINGSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        inst._pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        inst._pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;
      }
    }

    //If the player castled queenside (check that the from and to coordinates match a queenside castle).
    if (inst._turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == ChessConstants.WHITE_KING_SQUARE && toCoordinate == ChessConstants.WHITE_QUEENSIDE_BISHOP_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == ChessConstants.BLACK_KING_SQUARE && toCoordinate == ChessConstants.BLACK_QUEENSIDE_BISHOP_SQUARE))
    {
      //If they do, check that they actually have castling rights for the queen side.
      if (piece == PieceType.WHITE_KING ? inst._whiteCastlingRights.queenSide : inst._blackCastlingRights.queenSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_QUEEN_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_QUEEN_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_QUEENSIDE_ROOK_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_QUEENSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        inst._pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        inst._pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;
      }
    }

    //The move was successful if we got this far.
    return true;
  }
  
  //Castling and en passant

  //Retrieves the coord of the en passant square
  public getEnPassantSquare(): string
  {
    return this._enPassantSquare;
  }

  //Sets en passant square to the passed coord.
  public setEnPassantSquare(coord: string): void
  {
    this._enPassantSquare = coord;
  }

  //Retrieves one of the four castling rights types.
  public getCastlingRights(type: CastlingRightsType): boolean
  {
    switch(type)
    {
      case CastlingRightsType.WhiteKingside:
        return this._whiteCastlingRights.kingSide;

      case CastlingRightsType.WhiteQueenside:
        return this._whiteCastlingRights.queenSide;

      case CastlingRightsType.BlackKingside:
        return this._blackCastlingRights.kingSide;

      case CastlingRightsType.BlackQueenside:
        return this._blackCastlingRights.queenSide;
    }
  }

  //Sets the castling rights for one of the four types
  public setCastlingRights(type: CastlingRightsType, val: boolean): void
  {
    switch(type)
    {
      case CastlingRightsType.WhiteKingside:
        this._whiteCastlingRights.kingSide = val;
        break;

      case CastlingRightsType.WhiteQueenside:
        this._whiteCastlingRights.queenSide = val;
        break;

      case CastlingRightsType.BlackKingside:
        this._blackCastlingRights.kingSide = val;
        break;

      case CastlingRightsType.BlackQueenside:
        this._blackCastlingRights.queenSide = val;
    }
  }

  //#endregion

  //#region Instantiation
  //New object from a FEN notation
  static instantiateFromFen(fen: string)
  {
    const obj = new EditorState();
    try 
    {
      const splitFen = fen.split(" ");
      const board = splitFen[0];
      const turn = splitFen[1];
      const castlingRights = splitFen[2];
      const enPassantSquare = splitFen[3];
      const halfMoveClock = Number(splitFen[4]);
      const fullMoveClock = Number(splitFen[5]);

      const boardRows = board.split("/");

      for(let row = 0; row < ChessConstants.SIZE; row++)
      {
        //instantiate board here
        obj._pieceState[row] = [];

        let col = 0;

        for (const char of boardRows[row])
        {
            //if there are empty squares (represented by a number)
            if (!isNaN(Number(char)))
            {
                const emptyCount = Number(char);

                for (let j = 0; j < emptyCount; j++)
                {
                  obj._pieceState[row][col] = PieceType.NONE;
                  col++;
                }
            }
            //if there is a piece on the board.
            else
            {
              obj._pieceState[row][col] =
                  EditorFenHelper.getPieceFromFenPiece(char);

              col++;
            }
        }
      }

      //active color
      obj._turn = turn === PieceColor.WHITE ? true : false;

      //castling
      const castling = EditorFenHelper.getCastlingRightsFromFen(castlingRights);
      obj._whiteCastlingRights = castling.white;
      obj._blackCastlingRights = castling.black;

      //en passant
      if (enPassantSquare != "-")
      {
        obj._enPassantSquare = enPassantSquare;
      }

      //half move
      obj._halfMovesWithoutPawnMovementsOrCaptures = halfMoveClock;

      //full move
      obj._fullMoveCounter = fullMoveClock;
    }
    catch(ex)
    {
      console.error("Cannot instantiate, FEN was invalid.");
      throw ex;
    }

    return obj;
  }

  //Clones every single field of the object.
  public clone(): EditorState
  {
    const copy = new EditorState();

    //pieces
    copy._pieceState = structuredClone(this._pieceState);

    //turn
    copy._turn = this._turn;

    //en passant
    copy._enPassantSquare = this._enPassantSquare;

    //castling rights
    copy._whiteCastlingRights = new EditorCastlingRights();
    copy._whiteCastlingRights.kingSide = this._whiteCastlingRights.kingSide;
    copy._whiteCastlingRights.queenSide = this._whiteCastlingRights.queenSide;

    copy._blackCastlingRights = new EditorCastlingRights();
    copy._blackCastlingRights.kingSide = this._blackCastlingRights.kingSide; 
    copy._blackCastlingRights.queenSide = this._blackCastlingRights.queenSide;

    //move counters
    copy._halfMovesWithoutPawnMovementsOrCaptures = this._halfMovesWithoutPawnMovementsOrCaptures;
    copy._fullMoveCounter = this._fullMoveCounter;

    //cached state
    copy._stateCache = this._stateCache.deepCopy();

    return copy;
  }

  //#endregion

  //#region FEN
  
  //FEN notation
  public getFEN(): string
  {
    //string to be built
    let fen: string = "";

    //board
    for(let i = 0; i < this._pieceState.length; i++)
    {
      //check each rank
      const currentRank = this._pieceState[i];
      
      //notation requires the number of consecutive empty squares
      let emptyCount = 0;

      //loop through each file in that rank
      for(let j = 0; j < currentRank.length; j++)
      {
        //check the piece that's in it
        const currentSquareContent = currentRank[j];

        //if there is one, increment
        if (currentSquareContent == PieceType.NONE)
        {
          emptyCount += 1;
        }
        else //if there isn't, append the empty squares counted and then add the piece
        {
          if (emptyCount > 0)
          {
            fen += emptyCount.toString();
            emptyCount = 0;
          }
          fen += EditorFenHelper.getFenPieceFromPiece(currentSquareContent);
        }
      } 

      if (emptyCount > 0)
      {
        fen += emptyCount.toString();
      }

      if (i != this._pieceState.length - 1)
      {
        fen += "/";
      }
    }

    //active color
    fen += " "; 
    fen += this._turn ? PieceColor.WHITE : PieceColor.BLACK;

    //castling
    fen += " "
    fen += EditorFenHelper.getFenCastlingRights(this._whiteCastlingRights, this._blackCastlingRights);

    //en passant
    fen += " "
    fen += this._enPassantSquare == "" ? "-" : this._enPassantSquare;

    //halfmove clock
    fen += " "
    fen += this._halfMovesWithoutPawnMovementsOrCaptures;

    //full move clock
    fen += " "
    fen += this._fullMoveCounter;
    return fen;
  }

  //#endregion

}

class EditorFenHelper
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

    static getFenCastlingRights(white: EditorCastlingRights, black: EditorCastlingRights)
    {
        if (!white.kingSide && !white.queenSide && !black.kingSide && !black.queenSide)
        {
            return "-"
        }

        let fenCastlingRights: string = "";

        if (white.kingSide)
        {
            fenCastlingRights += EditorFenHelper.getFenPieceFromPiece(PieceType.WHITE_KING);
        }

        if (white.queenSide)
        {
            fenCastlingRights += EditorFenHelper.getFenPieceFromPiece(PieceType.WHITE_QUEEN);
        }

        if (black.kingSide)
        {
            fenCastlingRights += EditorFenHelper.getFenPieceFromPiece(PieceType.BLACK_KING);
        }

        if (black.queenSide)
        {
            fenCastlingRights += EditorFenHelper.getFenPieceFromPiece(PieceType.BLACK_QUEEN);
        }
        
        return fenCastlingRights;
    }

    static getCastlingRightsFromFen(fenCastling: string):
    {
        white: EditorCastlingRights,
        black: EditorCastlingRights
    }
    {
        const white = new EditorCastlingRights();
        const black = new EditorCastlingRights();

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

class EditorCastlingRights
{
    queenSide: boolean = true;
    kingSide: boolean = true;

    removeBothCastlingRights()
    {
        this.queenSide = false;
        this.kingSide = false;
    }
}

//Used to cache the state one move ago.
class PreviousStateCache
{
  //the state of the board
  pieceState: Array<Array<string>> = 
  [
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
  ];

  //true: White's turn, false: black's turn
  turn: boolean = true; 
    
  //Special cases (castling/en passant)
  whiteKingsideCastlingRights = true;
  whiteQueensideCastlingRights = true;
  blackKingsideCastlingRights = true;
  blackQueensideCastlingRights = true;
  enPassantSquare: string = "";

  //move counters
  halfMovesWithoutPawnMovementsOrCaptures: number = 0;
  fullMoveCounter: number = 1;

  //used to track repetition
  _previousStateMap: Map<string, number> = new Map<string, number>();

  deepCopy(): PreviousStateCache {
  const copy = new PreviousStateCache();

  //2D board array
  copy.pieceState = this.pieceState.map(row => [...row]);
  copy.turn = this.turn;

  copy.whiteKingsideCastlingRights = this.whiteKingsideCastlingRights;
  copy.whiteQueensideCastlingRights = this.whiteQueensideCastlingRights;
  copy.blackKingsideCastlingRights = this.blackKingsideCastlingRights;
  copy.blackQueensideCastlingRights = this.blackQueensideCastlingRights;

  copy.enPassantSquare = this.enPassantSquare;

  copy.halfMovesWithoutPawnMovementsOrCaptures = this.halfMovesWithoutPawnMovementsOrCaptures;

  copy.fullMoveCounter = this.fullMoveCounter;

  //Map deep copy
  copy._previousStateMap = new Map(this._previousStateMap);

  return copy;
  }
}