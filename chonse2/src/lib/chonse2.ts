import CastlingRights from "./castling-rights";
import { PieceColor } from "./piece-color";
import PieceMaterial from "./piece-material";
import { PieceType } from "./piece-type";
import { GameOverReason, GameState } from "./game-state";
import FenHelper from "./fen-helper";

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
  static readonly SIZE: number = 8;
  static readonly WHITE_PAWN_RANK = 2;
  static readonly BLACK_PAWN_RANK = 7;
  static readonly WHITE_PAWN_PROMOTE_RANK = 8;
  static readonly BLACK_PAWN_PROMOTE_RANK = 1;
  static readonly WHITE_QUEENSIDE_KNIGHT_SQUARE = "b1";
  static readonly WHITE_QUEENSIDE_BISHOP_SQUARE = "c1";
  static readonly WHITE_QUEENSIDE_ROOK_SQUARE = "a1";
  static readonly WHITE_KINGSIDE_BISHOP_SQUARE = "f1";
  static readonly WHITE_KINGSIDE_KNIGHT_SQUARE = "g1";
  static readonly WHITE_KINGSIDE_ROOK_SQUARE = "h1";
  static readonly WHITE_QUEEN_SQUARE = "d1";
  static readonly WHITE_KING_SQUARE = "e1"
  static readonly BLACK_QUEENSIDE_KNIGHT_SQUARE = "b8";
  static readonly BLACK_QUEENSIDE_BISHOP_SQUARE = "c8";
  static readonly BLACK_QUEENSIDE_ROOK_SQUARE = "a8";
  static readonly BLACK_KINGSIDE_KNIGHT_SQUARE = "g8";
  static readonly BLACK_KINGSIDE_BISHOP_SQUARE = "f8";
  static readonly BLACK_KINGSIDE_ROOK_SQUARE = "h8"
  static readonly BLACK_QUEEN_SQUARE = "d8";
  static readonly BLACK_KING_SQUARE = "e8";

  private static readonly _BISHOP_VECTOR_X = [-1, -1, 1, 1];
  private static readonly _BISHOP_VECTOR_Y = [-1, 1, -1, 1];
  private static readonly _ROOK_VECTOR_X = [-1, 1, 0, 0];
  private static readonly _ROOK_VECTOR_Y = [0, 0, -1, 1];
  private static readonly _QUEEN_KING_VECTOR_X = [-1, 1, 0, 0, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, -1, 1, 1];
  private static readonly _QUEEN_KING_VECTOR_Y = [0, 0, -1, 1, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, 1, -1, 1];
  private static readonly _WHITE_EP_TRIGGERS = new Map<string, string>([
      ["a2-a4", "a3"],
      ["b2-b4", "b3"],
      ["c2-c4", "c3"],
      ["d2-d4", "d3"],
      ["e2-e4", "e3"],
      ["f2-f4", "f3"],
      ["g2-g4", "g3"],
      ["h2-h4", "h3"],
  ]);

  private static readonly _BLACK_EP_TRIGGERS = new Map<string, string>([
      ["a7-a5", "a6"],
      ["b7-b5", "b6"],
      ["c7-c5", "c6"],
      ["d7-d5", "d6"],
      ["e7-e5", "e6"],
      ["f7-f5", "f6"],
      ["g7-g5", "g6"],
      ["h7-h5", "h6"],
  ]);

  //captures
  piecesWhiteCaptured: string[] = [];
  piecesBlackCaptured: string[] = [];
  promotionalMaterialDifference: number = 0;

  //the state of the board
  pieceState: Array<Array<string>>;
  gameState: GameState = new GameState();

  //true: White's turn, false: black's turn
  turn: boolean = true; 
    
  //Special cases (castling/en passant)
  whiteCastlingRights: CastlingRights = new CastlingRights();
  blackCastlingRights: CastlingRights = new CastlingRights();
  enPassantSquare: string = "";

  //move counters
  halfMoveCounter: number = 0;
  fullMoveCounter: number = 1;

  //instantiates with either a passed game state or the default one.
  constructor(passedState: Array<Array<string>> = Chonse2.DEFAULT_PIECE_STATE)
  {
    this.pieceState = passedState;

    if (this.pieceState.length != Chonse2.SIZE)
    {
        throw("BOARD SHOULD BE OF SIZE " + Chonse2.SIZE);
    }

    //validates correct number of files per rank.
    this.pieceState.forEach( rank => 
    {
    if (rank.length != Chonse2.SIZE)
    {
        throw("BOARD SHOULD BE OF SIZE " + Chonse2.SIZE);
    }
    });
  }

  getLegalMoves(coordinate: string): Array<string>
  {
    if (this.gameState.isGameOver)
    {
      return [];
    }

    //Where the piece is within the state.
    const index = Chonse2.findIndexFromCoordinate(coordinate);

    //The piece that is being moved.
    const piece = this.pieceState[index.rowIndex][index.colIndex];

    if (piece == ""
      || (piece.startsWith(PieceColor.WHITE) && !this.turn)
      || (piece.startsWith(PieceColor.BLACK) && this.turn)
    )
    {
      return [];
    }

    //The moves disregarding checks.
    const potentiallyLegalMoves = this._getPotentiallyLegalMoves(coordinate);

    //Out of the available potential legal moves, use dummy moves to see if the player would be in check after. If so, it is not a legal move.
    const legalMoves = potentiallyLegalMoves.filter(item =>
      {
        //Create a deep copy with all its functions.
        const deepCopy: Chonse2 = this._clone();

        //Test the dummy move using a stripped-down version
        Chonse2._playDummyMove(deepCopy, coordinate, item);

        //Return true if the player was not in check after the legal move, false if the move would put them in check
        return this.turn ? !deepCopy.isInCheck(PieceColor.WHITE) : !deepCopy.isInCheck(PieceColor.BLACK);
      }
    )

    return legalMoves;
  }

  completeMove(fromCoordinate: string, toCoordinate: string, promotionPiece = PieceType.QUEEN): boolean
  {
    if (this.gameState.isGameOver)
    {
      return false;
    }

    //In piece state, where the current piece is moving to.
    const toSquareIndex = Chonse2.findIndexFromCoordinate(toCoordinate);

    //In the piece state, where the current piece is moving from.
    const fromSquareIndex = Chonse2.findIndexFromCoordinate(fromCoordinate);

    //Extract the piece from the square that is being moved from.
    let piece = this.pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex];

    //So far, potentially legal moves not counting checks.
    const legalMoves = this.getLegalMoves(fromCoordinate); 

    if (!legalMoves.includes(toCoordinate))
    {
      return false;
    }

    //The piece already present in the square the current piece is moving to (being captured)
    const pieceInToSquare = this.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex];

    //Handle en passant
    if (toCoordinate == this.enPassantSquare && (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN))
    {
      //Remove the pawn that just got en passant'd
      this.turn ? this.pieceState[toSquareIndex.rowIndex+1][toSquareIndex.colIndex] = "" : this.pieceState[toSquareIndex.rowIndex-1][toSquareIndex.colIndex] = ""; 
    
      //Add the captured piece.
      this.turn ? this.piecesWhiteCaptured.push(PieceType.BLACK_PAWN) : this.piecesBlackCaptured.push(PieceType.WHITE_PAWN);
    }
    //Update the en passant square.
    this.enPassantSquare = this._getEnPassantSquareIfExists(fromCoordinate, toCoordinate, this.turn);

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
      piece == PieceType.WHITE_PAWN && toCoordinate.includes(Chonse2.WHITE_PAWN_PROMOTE_RANK.toString()) ||
      piece == PieceType.BLACK_PAWN && toCoordinate.includes(Chonse2.BLACK_PAWN_PROMOTE_RANK.toString()))
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

    //If the player castled kingside (check that the from and to coordinates match a kingside castle).
    if (this.turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == Chonse2.WHITE_KING_SQUARE && toCoordinate == Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == Chonse2.BLACK_KING_SQUARE && toCoordinate == Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE))
    {
      //If they do, check that they actually have castling rights for the king side.
      if (piece == PieceType.WHITE_KING ? this.whiteCastlingRights.kingSide : this.blackCastlingRights.kingSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_KINGSIDE_ROOK_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_KINGSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        this.pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        this.pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;

        //Removes castling rights as a player cannot castle multiple times.
        piece == PieceType.WHITE_KING ? this.whiteCastlingRights.removeBothCastlingRights() : this.blackCastlingRights.removeBothCastlingRights();
      }
    }

    //If the player castled queenside (check that the from and to coordinates match a queenside castle).
    if (this.turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == Chonse2.WHITE_KING_SQUARE && toCoordinate == Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == Chonse2.BLACK_KING_SQUARE && toCoordinate == Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE))
    {
      //If they do, check that they actually have castling rights for the queen side.
      if (piece == PieceType.WHITE_KING ? this.whiteCastlingRights.queenSide : this.blackCastlingRights.queenSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_QUEEN_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_QUEEN_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_QUEENSIDE_ROOK_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_QUEENSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        this.pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        this.pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;

        //Removes castling rights as a player cannot castle multiple times.
        piece == PieceType.WHITE_KING ? this.whiteCastlingRights.removeBothCastlingRights() : this.blackCastlingRights.removeBothCastlingRights();
      }
    }
    
    //If the player moved their king, strip castling rights on both sides.
    if (this.turn == true ? piece == PieceType.WHITE_KING : piece == PieceType.BLACK_KING)
    {
      this.turn == true ? this.whiteCastlingRights.removeBothCastlingRights() : this.blackCastlingRights.removeBothCastlingRights();
    }
  
    //If the player moved their rook, remove castling rights for that side.
    if (this.turn == true ? piece == PieceType.WHITE_ROOK : piece == PieceType.BLACK_ROOK)
    {
      if (this.turn && fromCoordinate == Chonse2.WHITE_KINGSIDE_ROOK_SQUARE)
      {
        this.whiteCastlingRights.kingSide = false;
      }

      if (this.turn && fromCoordinate == Chonse2.WHITE_QUEENSIDE_ROOK_SQUARE)
      {
        this.whiteCastlingRights.queenSide = false;
      }

      if (!this.turn && fromCoordinate == Chonse2.BLACK_KINGSIDE_ROOK_SQUARE)
      {
        this.blackCastlingRights.kingSide = false;
      }

      if (!this.turn && fromCoordinate == Chonse2.BLACK_QUEENSIDE_ROOK_SQUARE)
      {
        this.blackCastlingRights.queenSide = false;
      }
    }

    //If the player had that rook captured, remove castling rights for that side
    if (this.turn && toCoordinate == Chonse2.BLACK_KINGSIDE_ROOK_SQUARE)
    {
      this.blackCastlingRights.kingSide = false;
    }

    if (this.turn && toCoordinate == Chonse2.BLACK_QUEENSIDE_ROOK_SQUARE)
    {
      this.blackCastlingRights.queenSide = false;
    }

    if (!this.turn && toCoordinate == Chonse2.WHITE_KINGSIDE_ROOK_SQUARE)
    {
      this.whiteCastlingRights.kingSide = false;
    }

    if (!this.turn && toCoordinate == Chonse2.WHITE_QUEENSIDE_ROOK_SQUARE)
    {
      this.whiteCastlingRights.queenSide = false;
    }

    //Once this player finishes their move, it's the next person's turn.
    this.turn = !this.turn;

    //check for checkmate, stalemate, etc
    this._updateGameState();

    //The move was successful if we got this far.
    return true;
  }
  
  //Gets the row and column indeces when a rank and file coordinate are passed in.
  static findIndexFromCoordinate(coordinate: string) : { rowIndex: number, colIndex: number }
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

  isInCheck(kingColor: string)
  {
    //If the color isn't valid, don't bother checking for checks (haha get it)
    if (kingColor != PieceColor.BLACK && kingColor != PieceColor.WHITE)
    {
      return false;
    }

    //The coordinate of the current color king
    const kingCoordinate: string = this.getKingCoordinate(kingColor);

    return this.isSquareAttacked(kingCoordinate, PieceColor.getOpposite(kingColor))
  }

  getKingCoordinate(kingColor: string): string
  {
    if (kingColor != PieceColor.BLACK && kingColor != PieceColor.WHITE)
    {
      return "";
    }

    const rIdx = this.pieceState.findIndex( row => row.includes( (kingColor == PieceColor.WHITE ? PieceType.WHITE_KING : PieceType.BLACK_KING) ) )
    
    if (rIdx == -1)
    {
      return "";
    }

    const cIdx = this.pieceState[rIdx].findIndex( p => p === (kingColor == PieceColor.WHITE ? PieceType.WHITE_KING : PieceType.BLACK_KING))
  
    return Chonse2.COORDS[rIdx][cIdx];
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


  isSquareAttacked(coord: string, attackerColor: string): boolean 
  {
    if (attackerColor != PieceColor.WHITE && attackerColor != PieceColor.BLACK)
    {
      return false;
    }

    const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coord);

    //The legal moves of the given piece types in this position.
    const rookMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), Chonse2._ROOK_VECTOR_X, Chonse2._ROOK_VECTOR_Y);
    const queenMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), Chonse2._QUEEN_KING_VECTOR_X, Chonse2._QUEEN_KING_VECTOR_Y);
    const kingMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), Chonse2._QUEEN_KING_VECTOR_X, Chonse2._QUEEN_KING_VECTOR_Y, 1);
    const bishopMoves = this._getVectorMoves(coord, PieceColor.getOpposite(attackerColor), Chonse2._BISHOP_VECTOR_X, Chonse2._BISHOP_VECTOR_Y);
    const knightMoves = this._getPotentiallyLegalKnightMoves(coord, PieceColor.getOpposite(attackerColor));

    //Check if a rook can attack the square
    const rookPiece = attackerColor + PieceType.ROOK;
    for(let seenSquare of rookMoves)
    {
      const seenSquareIndex = Chonse2.findIndexFromCoordinate(seenSquare);
      if (this.pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == rookPiece)
      {
        return true;
      }
    }

    //Check if a queen can attack the square.
    const queenPiece = attackerColor + PieceType.QUEEN;
    for(let seenSquare of queenMoves)
    {
      const seenSquareIndex = Chonse2.findIndexFromCoordinate(seenSquare);
      if (this.pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == queenPiece)
      {
        return true;
      }
    }

    //Check if a king can attack the square.
    const kingPiece = attackerColor + PieceType.KING;
    for(let seenSquare of kingMoves)
    {
      const seenSquareIndex = Chonse2.findIndexFromCoordinate(seenSquare);
      if (this.pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == kingPiece)
      {
        return true;
      }
    }

    //Check if a king can attack the square.
    const bishopPiece = attackerColor + PieceType.BISHOP;
    for(let seenSquare of bishopMoves)
    {
      const seenSquareIndex = Chonse2.findIndexFromCoordinate(seenSquare);
      if (this.pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == bishopPiece)
      {
        return true;
      }
    }

    //Check if a knight can see the square.
    const knightPiece = attackerColor + PieceType.KNIGHT;
    for(let seenSquare of knightMoves)
    {
      const seenSquareIndex = Chonse2.findIndexFromCoordinate(seenSquare);
      if (this.pieceState[seenSquareIndex.rowIndex][seenSquareIndex.colIndex] == knightPiece)
      {
        return true;
      }
    }

    //Check if there's a pawn that can strike diagonally
    const pawnPiece = attackerColor + PieceType.PAWN;
    const rankAbove = attackerColor == PieceColor.BLACK ? this.pieceState[rowIndex - 1] : this.pieceState[rowIndex + 1];
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

  getFEN(): string
  {
    //string to be built
    let fen: string = "";

    //board
    for(let i = 0; i < this.pieceState.length; i++)
    {
      //check each rank
      const currentRank = this.pieceState[i];
      
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
          fen += FenHelper.getFenPieceFromPiece(currentSquareContent);
        }
      } 

      if (emptyCount > 0)
      {
        fen += emptyCount.toString();
      }

      if (i != this.pieceState.length - 1)
      {
        fen += "/";
      }
    }

    //active color
    fen += " "; 
    fen += this.turn ? PieceColor.WHITE : PieceColor.BLACK;

    //castling
    fen += " "
    fen += FenHelper.getFenCastlingRights(this.whiteCastlingRights, this.blackCastlingRights);

    //en passant
    fen += " "
    fen += this.enPassantSquare == "" ? "-" : this.enPassantSquare;

    //halfmove clock
    fen += " "
    fen += this.halfMoveCounter;

    //full move clock
    fen += " "
    fen += this.fullMoveCounter;
    return fen;
  }

  //#region Inner legal move helper functions

  private _getPotentiallyLegalMoves(coordinate: string): Array<string>
  {
    const index = Chonse2.findIndexFromCoordinate(coordinate);
    const piece = this.pieceState[index.rowIndex][index.colIndex];
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
  
  private _getPotentiallyLegalPawnMoves(coordinate: string, color: string): Array<string>
  {
    const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coordinate);
    const legalMoves:Array<string> = [];

    //rank ahead of this one
    const rankAbove = color == PieceColor.WHITE ? this.pieceState.at(rowIndex - 1) : this.pieceState.at(rowIndex + 1);
    const rankNumber = Number(coordinate[1]);

    //if the rank above this one exists, there might be a legal move
    if (rankAbove)
    {
      const squareInFront = rankAbove.at(colIndex);

      //if the square directly in front of it has nothing in it, then it can be moved to.
      if (squareInFront == "")
      {
        color == PieceColor.WHITE ? legalMoves.push(Chonse2.COORDS[rowIndex - 1][colIndex]) : legalMoves.push(Chonse2.COORDS[rowIndex + 1][colIndex]);
      }

      //if this column is not the leftmost one, then it can potentially capture a piece left-diagonally.
      if (colIndex != 0)
      {
        //The piece content of the left capture square.
        const leftCaptureSquare = rankAbove.at(colIndex - 1);

        //The coordinate of the above square.
        const leftCaptureSquareCoord = color == PieceColor.WHITE ? Chonse2.COORDS[rowIndex - 1][colIndex - 1] : Chonse2.COORDS[rowIndex + 1][colIndex - 1];

        //The square is a legal move if it has an opposing piece OR it is the en passant square
        if (leftCaptureSquare?.startsWith(color == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE) 
          || leftCaptureSquareCoord == this.enPassantSquare)
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
        const rightCaptureSquareCoord = color == PieceColor.WHITE ? Chonse2.COORDS[rowIndex - 1][colIndex + 1] : Chonse2.COORDS[rowIndex + 1][colIndex + 1]

        //The square is a legal move if it has an opposing piece OR it is the en passant square
        if (rightCaptureSquare?.startsWith(color == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE)
          || rightCaptureSquareCoord == this.enPassantSquare)
        {
          legalMoves.push(rightCaptureSquareCoord);
        }
      }

      if (color == PieceColor.WHITE ? rankNumber == Chonse2.WHITE_PAWN_RANK : rankNumber === Chonse2.BLACK_PAWN_RANK)
      {
        //two ranks ahead of where the pawn is.
        const twoRanksAbove = color == PieceColor.WHITE ? this.pieceState.at(rowIndex - 2) : this.pieceState.at(rowIndex + 2);

        //the two squares above it can potentially be legal moves.
        if (twoRanksAbove)
        {
          const twoSquaresAbove = twoRanksAbove.at(colIndex);

          //two squares up is only legal if one square up is.
          if (twoSquaresAbove == "")
          {
            color == PieceColor.WHITE ? legalMoves.push(Chonse2.COORDS[rowIndex - 2][colIndex]) : legalMoves.push(Chonse2.COORDS[rowIndex + 2][colIndex]);;
          }
        }
      }
    }
    return legalMoves;
  }
  
  private _getPotentiallyLegalKnightMoves(coordinate: string, color: string) : Array<string>
  {
    const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coordinate);
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
            (color == PieceColor.WHITE ? potentialMoveSquare.startsWith(PieceColor.BLACK) : potentialMoveSquare.startsWith(PieceColor.WHITE)) 
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
    
  private _getPotentiallyLegalBishopMoves(coordinate: string, color: string): Array<string>
  {
    return this._getVectorMoves(coordinate, color, Chonse2._BISHOP_VECTOR_X, Chonse2._BISHOP_VECTOR_Y);
  }
  
  private _getPotentiallyLegalRookMoves(coordinate: string, color: string): Array<string>
  {
    return this._getVectorMoves(coordinate, color, Chonse2._ROOK_VECTOR_X, Chonse2._ROOK_VECTOR_Y);
  }
  
  private _getPotentiallyLegalQueenMoves(coordinate: string, color: string) : Array<string>
  {
    return this._getVectorMoves(coordinate, color, Chonse2._QUEEN_KING_VECTOR_X, Chonse2._QUEEN_KING_VECTOR_Y);
  }
  
  private _getPotentiallyLegalKingMoves(coordinate: string, color: string): Array<string>
  {
    const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coordinate);
    let piece = this.pieceState[rowIndex][colIndex];

      //Base moves.
      let legalMoves = this._getVectorMoves(coordinate, color, Chonse2._QUEEN_KING_VECTOR_X, Chonse2._QUEEN_KING_VECTOR_Y, 1);

      //King cannot castle while in check
      if (!this.isInCheck(color))
      {
        //TODO: MAKE SURE KING CANNOT CASTLE THROUGH A SQUARE THAT CAN BE SEEN BY AN ENEMY PIECE

        //Kingside castling moves. Ensures the player possesses castling rights before checking for their legal moves.
        if (this.turn == true ? this.whiteCastlingRights.kingSide : this.blackCastlingRights.kingSide)
        {
          //These two squares need to be free in order to castle kingside.
          const kingsideKnightSquare = Chonse2.findIndexFromCoordinate(this.turn == true ? Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE : Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE);
          const kingsideBishopSquare = Chonse2.findIndexFromCoordinate(this.turn == true ? Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE : Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE);
          const kingSquare = this.turn == true ? Chonse2.WHITE_KING_SQUARE : Chonse2.BLACK_KING_SQUARE;

          //Check if they're clear and that the king is not castling through an attacked square, and if so, push the castling square as a legal move.
          if (
            this.pieceState[kingsideKnightSquare.rowIndex][kingsideKnightSquare.colIndex] == ""
            && this.pieceState[kingsideBishopSquare.rowIndex][kingsideBishopSquare.colIndex] == "" 
            && !this.isSquareAttacked( (color == PieceColor.WHITE ? Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE : Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE), PieceColor.getOpposite(color) )
            && coordinate == kingSquare
          )
          {
            this.turn == true ? legalMoves.push(Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE) : legalMoves.push(Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE);
          }
        }

        //Queenside castling moves. Ensures the player possesses castling rights before checking for their legal moves.
        if (this.turn == true ? this.whiteCastlingRights.queenSide : this.blackCastlingRights.queenSide)
        {
          //These three squares need to be free in order to castle queenside.
          const queensideKnightSquare = Chonse2.findIndexFromCoordinate(this.turn == true ? Chonse2.WHITE_QUEENSIDE_KNIGHT_SQUARE : Chonse2.BLACK_QUEENSIDE_KNIGHT_SQUARE);
          const queensideBishopSquare = Chonse2.findIndexFromCoordinate(this.turn == true ? Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE : Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE);
          const queenSquare = Chonse2.findIndexFromCoordinate(this.turn == true ? Chonse2.WHITE_QUEEN_SQUARE : Chonse2.BLACK_QUEEN_SQUARE);
          const kingSquare = this.turn == true ? Chonse2.WHITE_KING_SQUARE : Chonse2.BLACK_KING_SQUARE;

          //Check if they're clear and that the king is not castling through an attacked square, and if so, push the castling square as a legal move.
          if (
            this.pieceState[queensideKnightSquare.rowIndex][queensideKnightSquare.colIndex] == ""
            && this.pieceState[queensideBishopSquare.rowIndex][queensideBishopSquare.colIndex] == ""
            && this.pieceState[queenSquare.rowIndex][queenSquare.colIndex] == ""
            && !this.isSquareAttacked(  (color == PieceColor.WHITE ? Chonse2.WHITE_QUEEN_SQUARE : Chonse2.BLACK_QUEEN_SQUARE), PieceColor.getOpposite(color)  )
            && coordinate == kingSquare
          )
          {
            this.turn == true ? legalMoves.push(Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) : legalMoves.push(Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE);
          }
        }
      }

      return legalMoves;   
  }
  
  private _getVectorMoves(coordinate: string, color: string, vectorX: Array<number>, vectorY: Array<number>, distance = Chonse2.SIZE): Array<string>
  {
    const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coordinate);
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
            const rowInQuestion = this.pieceState[rowIndex + currentXOffset];
  
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
                  legalMoves.push(Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset]);
                  break;
                }
  
                //If the square is empty, that is a legal move, and the one after it could be.
                if (potentialMoveSquare == "")
                {
                  legalMoves.push(Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset]);
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

  private _playerHasLegalMoves(turn: boolean): boolean
  {
    const color: string = turn ? PieceColor.WHITE : PieceColor.BLACK;
    const pieceCoords: Array<string> = [];
    const legalMoves: Array<string> = [];
    
    //Loop through each of these to get the coordinates of the pieces.
    for(let i = 0; i < Chonse2.COORDS.length; i++)
    {
      for(let j = 0; j < Chonse2.COORDS[i].length; j++)
      {
        const piece = this.pieceState[i][j];

        if ( piece.startsWith(color))
        {
          pieceCoords.push(Chonse2.COORDS[i][j]);
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

  /*private*/ _getAllPiecesAndCoordsByColor(color: string): {pieces: Array<string>, coords: Array<string>}
  {
    if (color != PieceColor.WHITE && color != PieceColor.BLACK)
    {
      return { pieces: [], coords: [] };
    }

    const pieces = [];
    const coordinates = [];

    //Loop through each of these to get the coordinates + pieces.
    for(let i = 0; i < Chonse2.COORDS.length; i++)
    {
      for(let j = 0; j < Chonse2.COORDS[i].length; j++)
      {
        const piece = this.pieceState[i][j];

        if ( piece.startsWith(color))
        {
          pieces.push(piece);
          coordinates.push(Chonse2.COORDS[i][j])
        }
      }
    }

    return { pieces: pieces, coords : coordinates};
  }

  _isDarkColoredSquare(rowIndex: number, fileIndex: number): boolean
  {
    return (rowIndex + fileIndex) % 2 == 1;
  }

  private static _playDummyMove(inst: Chonse2, fromCoordinate: string, toCoordinate: string, promotionPiece = PieceType.QUEEN)
  {
    //In piece state, where the current piece is moving to.
    const toSquareIndex = Chonse2.findIndexFromCoordinate(toCoordinate);

    //In the piece state, where the current piece is moving from.
    const fromSquareIndex = Chonse2.findIndexFromCoordinate(fromCoordinate);

    //Extract the piece from the square that is being moved from.
    let piece = inst.pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex];

    //The piece already present in the square the current piece is moving to (being captured)
    const pieceInToSquare = inst.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex];

    //Handle en passant
    if (toCoordinate == inst.enPassantSquare && (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN))
    {
      //Remove the pawn that just got en passant'd
      inst.turn ? inst.pieceState[toSquareIndex.rowIndex+1][toSquareIndex.colIndex] = "" : inst.pieceState[toSquareIndex.rowIndex-1][toSquareIndex.colIndex] = ""; 
    
      //Add the captured piece.
      inst.turn ? inst.piecesWhiteCaptured.push(PieceType.BLACK_PAWN) : inst.piecesBlackCaptured.push(PieceType.WHITE_PAWN);
    }
    
    //Clear the old piece position.
    inst.pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex] = "";

    //Replace it in the new position.
    inst.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;

    //If the player castled kingside (check that the from and to coordinates match a kingside castle).
    if (inst.turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == Chonse2.WHITE_KING_SQUARE && toCoordinate == Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == Chonse2.BLACK_KING_SQUARE && toCoordinate == Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE))
    {
      //If they do, check that they actually have castling rights for the king side.
      if (piece == PieceType.WHITE_KING ? inst.whiteCastlingRights.kingSide : inst.blackCastlingRights.kingSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_KINGSIDE_ROOK_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_KINGSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        inst.pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        inst.pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;
      }
    }

    //If the player castled queenside (check that the from and to coordinates match a queenside castle).
    if (inst.turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == Chonse2.WHITE_KING_SQUARE && toCoordinate == Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == Chonse2.BLACK_KING_SQUARE && toCoordinate == Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE))
    {
      //If they do, check that they actually have castling rights for the queen side.
      if (piece == PieceType.WHITE_KING ? inst.whiteCastlingRights.queenSide : inst.blackCastlingRights.queenSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_QUEEN_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_QUEEN_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? Chonse2.findIndexFromCoordinate(Chonse2.WHITE_QUEENSIDE_ROOK_SQUARE) : Chonse2.findIndexFromCoordinate(Chonse2.BLACK_QUEENSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        inst.pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        inst.pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;
      }
    }

    //The move was successful if we got this far.
    return true;
  }
  //#endregion

  //#region Inner state management
  private _getEnPassantSquareIfExists(fromSquare: string, toSquare: string, turn: boolean) : string
  {
    //En passant moves are stored with key fromsquare-tosquare
    const key = fromSquare + "-" + toSquare;

    //Gets the en passant square corresponding to the double pawn move if it exists.
    const val = turn ? Chonse2._WHITE_EP_TRIGGERS.get(key) : Chonse2._BLACK_EP_TRIGGERS.get(key);

    //Return it if it exists or empty string otherwise.
    return val == null ? "" : val;
  }

  isEnPassantCaptureActuallyPossible() : boolean
  {
    if (this.enPassantSquare == "")
    {
      return false;
    }

    //The place within the piece state that the en passant square can be found
    let enPassantSquareIndex = Chonse2.findIndexFromCoordinate(this.enPassantSquare);
    
    //Only run the necessary checks if there is an en passant square.
    if (enPassantSquareIndex)
    {
      //Gets the row so that the pawns next to it can be checked.
      const rankEnPassantPawnIsOn = this.turn ? this.pieceState[enPassantSquareIndex.rowIndex + 1] : this.pieceState[enPassantSquareIndex.rowIndex - 1];

      //The squares that might have pawns that could capture.
      const potentialOpposingPawnLeftSquare = rankEnPassantPawnIsOn[enPassantSquareIndex.colIndex - 1];
      const potentialOpposingPawnRightSquare = rankEnPassantPawnIsOn[enPassantSquareIndex.colIndex + 1];

      //If there are indeed pawns of the color opposing the pawn that just moved two spaces to the left or right, then an en passant capture is possible.
      if (potentialOpposingPawnLeftSquare)
      {
        if (this.turn ? potentialOpposingPawnLeftSquare == PieceType.WHITE_PAWN : potentialOpposingPawnLeftSquare == PieceType.BLACK_PAWN)
        {
          return true;
        }
      }

      if (potentialOpposingPawnRightSquare)
      {
        if (this.turn ? potentialOpposingPawnRightSquare == PieceType.WHITE_PAWN : potentialOpposingPawnRightSquare == PieceType.BLACK_PAWN)
        {
          return true;
        }
      }
    }

    return false; 
  }

  private _clone()
  {
    const copy = new Chonse2();

    copy.pieceState = structuredClone(this.pieceState);
    copy.turn = this.turn;
    copy.enPassantSquare = this.enPassantSquare;
    copy.whiteCastlingRights = structuredClone(this.whiteCastlingRights);
    copy.blackCastlingRights = structuredClone(this.blackCastlingRights);

  return copy;
  }

  private _updateGameState()
  {
    const nextPlayerHasLegalMoves = this._playerHasLegalMoves(this.turn);
    const playerColor: string = this.turn ? PieceColor.WHITE : PieceColor.BLACK;
    
    //Checkmate
    if (!nextPlayerHasLegalMoves && this.isInCheck(playerColor))
    {
      this.gameState.isGameOver = true;
      this.gameState.reason = GameOverReason.Checkmate;
      this.gameState.winner = PieceColor.getOpposite(playerColor);
    }

    //Stalemate
    if (!nextPlayerHasLegalMoves && !this.isInCheck(playerColor))
    {
      this.gameState.isGameOver = true;
      this.gameState.reason = GameOverReason.Stalemate;
    }

    //Insufficient material
    const whitePieceData = this._getAllPiecesAndCoordsByColor(PieceColor.WHITE);
    const blackPieceData = this._getAllPiecesAndCoordsByColor(PieceColor.BLACK);

    //Insufficient material case 1: King vs king
    const isKingVsKing: boolean = (
      (whitePieceData.pieces.length == 1 && whitePieceData.pieces[0] == PieceType.WHITE_KING)
      && (blackPieceData.pieces.length == 1 && blackPieceData.pieces[0] == PieceType.BLACK_KING)
    );

    //Insufficient material case 2: King vs bishop and king.
    const isKingVsBishopAndKing: boolean = (
      (whitePieceData.pieces.length == 1 && whitePieceData.pieces[0] == PieceType.WHITE_KING && blackPieceData.pieces.length == 2 && blackPieceData.pieces.some( p => p == PieceType.BLACK_BISHOP ))
      || (blackPieceData.pieces.length == 1 && blackPieceData.pieces[0] == PieceType.BLACK_KING && whitePieceData.pieces.length == 2 && whitePieceData.pieces.some( p => p == PieceType.WHITE_BISHOP ))
    );

    //Insufficient material case 3: King vs knight and king.
    const isKingVsKnightAndKing: boolean = (
      (whitePieceData.pieces.length == 1 && whitePieceData.pieces[0] == PieceType.WHITE_KING && blackPieceData.pieces.length == 2 && blackPieceData.pieces.some( p => p == PieceType.BLACK_KNIGHT ))
      || (blackPieceData.pieces.length == 1 && blackPieceData.pieces[0] == PieceType.BLACK_KING && whitePieceData.pieces.length == 2 && whitePieceData.pieces.some( p => p == PieceType.WHITE_KNIGHT ))
    );
    

    //Insufficient material case 4: King vs bishop and king on the same color
    let isKingAndBishopVsKingAndBishopOnSameColor: boolean = false;
    const bothSidesHaveKingAndBishop: boolean = (
      (whitePieceData.pieces.length == 2 && whitePieceData.pieces.some( p => p == PieceType.WHITE_KING ) && whitePieceData.pieces.some( p => p == PieceType.WHITE_BISHOP ) )
      && (blackPieceData.pieces.length == 2 && blackPieceData.pieces.some( p => p == PieceType.BLACK_KING ) && blackPieceData.pieces.some(p => p == PieceType.BLACK_BISHOP))
    )
    if (bothSidesHaveKingAndBishop)
    {
      const whiteBishopCoord: string = whitePieceData.coords[whitePieceData.pieces.findIndex( p => p === PieceType.WHITE_BISHOP )];
      const whiteBishopIndex = Chonse2.findIndexFromCoordinate(whiteBishopCoord);

      const blackBishopCoord: string = blackPieceData.coords[blackPieceData.pieces.findIndex( p => p === PieceType.BLACK_BISHOP )];
      const blackBishopIndex = Chonse2.findIndexFromCoordinate(blackBishopCoord);
      
      const wbIsDark: boolean = this._isDarkColoredSquare(whiteBishopIndex.rowIndex, whiteBishopIndex.colIndex);
      const bbIsDark: boolean = this._isDarkColoredSquare(blackBishopIndex.rowIndex, blackBishopIndex.colIndex);

      if (wbIsDark == bbIsDark)
      {
        isKingAndBishopVsKingAndBishopOnSameColor = true;
      }
    }

    if (isKingVsKing 
      || isKingVsBishopAndKing
      || isKingVsKnightAndKing 
      || isKingAndBishopVsKingAndBishopOnSameColor 
        )
      {
        this.gameState.isGameOver = true;
        this.gameState.reason = GameOverReason.InsufficientMaterial;
      }

    //fifty moves with no pawn movements or captures

    //threefold repetition

  }
  //#endregion
}