import CastlingRights from "./castling-rights";
import { PieceColor } from "../../types/piece-color";
import { PieceType } from "../../types/piece-type";
import { GameOverReason, GameScore, GameState } from "../../types/game-state";
import FenHelper from "./fen-helper";
import AlgebraicNotationMaker from "../../types/algebraic-notation-builder";
import { CastlingRightsType } from "../../types/castling-rights-type";
import IChessGame from "../../i-chess-game";
import { IMoveResult } from "../../types/move-result";
import { ChessConstants } from "../../types/constants";
import PieceMaterial from "../../types/piece-material";

export default class Chonse2 implements IChessGame
{
  //Draw condition thresholds
  static readonly DRAW_BY_REPETITION_THRESHOLD: number = 3;
  static readonly DRAW_BY_NO_CAPTURES_OR_PAWN_MOVEMENTS_THRESHOLD = 100; //50 full moves * 2
  
  //To check draw by repetition, object internally stores a fen key split at index 2 (state + castling + en passant if possible) in a hashmap and checks how many times this key has appeared.
  private static readonly _FEN_SPLIT_POSKEY_INDEX = 2

  //En passant coords - O(1)
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

  //Captures
  private _piecesWhiteCaptured: string[] = [];
  private _piecesBlackCaptured: string[] = [];

  //Piece and board state.
  private _pieceState: Array<Array<string>>;
  private _gameState: GameState = new GameState();

  //True: White's turn, false: black's turn
  private _turn: boolean = true; 
    
  //Castling
  private _whiteCastlingRights: CastlingRights;
  private _blackCastlingRights: CastlingRights;

  //En passant
  private _enPassantSquare: string = "";

  //Move counters
  private _halfMovesWithoutPawnMovementsOrCaptures: number = 0;
  private _fullMoveCounter: number = 1;

  //Used to track repetition
  private _previousPositionMap: Map<string, number> = new Map<string, number>();

  //Previous state cache for efficiently (compared to my previous shitty implementation that created a bunch of objects) undoing the last move.
  private _stateCache: PreviousStateCache;

  //Instantiates with either a passed game state or the default one.
  constructor()
  {
    this._pieceState = ChessConstants.DEFAULT_PIECE_STATE.map(rank => [...rank])

    //Initialize castling rights
    this._whiteCastlingRights = new CastlingRights();
    this._blackCastlingRights = new CastlingRights();

    //Initialize state cache
    this._stateCache = new PreviousStateCache();
    
    //Starting position always counts towards the repetition.
    this._previousPositionMap.set(this._getPositionKey(), 1);
  }

  //#region Pieces + squares.
  //Gets the row and column indeces when a rank and file coordinate are passed in.
  public getPieceState(): string[][]
  {
    return this._pieceState.map(row => [...row]);
  }

  //Gets a piece based off the coordinates.
  public findPieceAtCoordinate(coord: string): string
  {
      const {rowIndex, colIndex} = ChessConstants.findIndexFromCoordinate(coord);

      return this._pieceState[rowIndex][colIndex];
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

  //Gets all pieces that attack/defend a given square.
  public getPiecesThatHitSquare(square: string): {whiteCoords: Array<string>, whitePieces: Array<string>, blackCoords: Array<string>, blackPieces: Array<string>} 
  {
      const boardCopy = this.clone();
      const {rowIndex, colIndex} = ChessConstants.findIndexFromCoordinate(square);
      const o: { whiteCoords: string[], whitePieces: string[], blackCoords: string[], blackPieces: string[] } = { whiteCoords: [], whitePieces: [], blackCoords: [], blackPieces: [] };

      const colors = [PieceColor.WHITE, PieceColor.BLACK]; 

      for (const currentColor of colors) {
          boardCopy._turn = currentColor == PieceColor.WHITE;
          
          //Enemy ghost pawn to simulate "capturing"
          boardCopy._pieceState[rowIndex][colIndex] = (currentColor === PieceColor.WHITE) ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

          //Loop through every single piece.
          for (let i = 0; i < ChessConstants.SIZE; i++) 
          {
              for (let j = 0; j < ChessConstants.SIZE; j++) 
              {
                  //The current piece we are checking
                  const piece = boardCopy._pieceState[i][j];
                  
                  //If there is no piece there, it has no legal moves.
                  if (piece === PieceType.NONE) 
                  {
                    continue;
                  };

                  //Ensures only the right color is checked.
                  if (piece[0] !== currentColor) continue;

                  //Gets the coordinate for the given square.
                  const coord = ChessConstants.COORDS[i][j];

                  let legalMoves: Array<string> = [];

                  //Need to check legal moves to see what squares it hits.
                  if (piece != PieceType.WHITE_KING && piece != PieceType.BLACK_KING)
                  {
                      //legalMoves = boardCopy.getLegalMoves(coord);
                      legalMoves = boardCopy._getPotentiallyLegalMoves(coord);
                  }
                  else 
                  {
                      //Circumvents the fact that the king cannot put himself in check because he could be the last defender of a piece.
                      legalMoves = boardCopy._getPotentiallyLegalKingMoves(coord, piece[0]);
                  }

                  //If the piece has the square in question as a legal move, push it.                
                  if (legalMoves.includes(square)) 
                  {
                      if (currentColor === PieceColor.WHITE) 
                      {
                        o.whiteCoords.push(coord);
                        o.whitePieces.push(piece);
                      } 
                      else 
                      {
                        o.blackCoords.push(coord)
                        o.blackPieces.push(piece);
                      }
                  }
              }
          }
      }
      return o;
  }

  //Gets parallel arrays for piece/coordinate by color.
  public getAllPiecesAndCoordsByColor(color: string): {pieces: Array<string>, coords: Array<string>}
  {
    if (color != PieceColor.WHITE && color != PieceColor.BLACK)
    {
      return { pieces: [], coords: [] };
    }

    const pieces = [];
    const coordinates = [];

    //Loop through each of these to get the coordinates + pieces.
    for(let i = 0; i < ChessConstants.COORDS.length; i++)
    {
      for(let j = 0; j < ChessConstants.COORDS[i].length; j++)
      {
        const piece = this._pieceState[i][j];

        if ( piece.startsWith(color))
        {
          pieces.push(piece);
          coordinates.push(ChessConstants.COORDS[i][j])
        }
      }
    }

    return { pieces: pieces, coords : coordinates};
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

  //Positive number signifies that white is up, negative signifies black is up.
  public getMaterialAdvantage(): number
  {
    //get each player's pieces in a separate array.
    const whitePieceData = this.getAllPiecesAndCoordsByColor(PieceColor.WHITE);
    const blackPieceData = this.getAllPiecesAndCoordsByColor(PieceColor.BLACK);

    let adv = 0;

    //add all white pieces on the board.
    whitePieceData.pieces.forEach( piece =>
    {
      const materialVal = PieceMaterial.getMaterialFromPiece(piece);
      adv += materialVal;
    })

    //subtract by the black pieces.
    blackPieceData.pieces.forEach( piece =>
    {
      const materialVal = PieceMaterial.getMaterialFromPiece(piece);
      adv -= materialVal; 
    })

    //result is the material advantage (+w -b)
    return adv;
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

  //Get captured pieces by color.
  public getPiecesCapturedByPlayer(color: string): Array<string>
  {
    if (color == PieceColor.BLACK)
    {
      return [...this._piecesBlackCaptured];
    }

    return [...this._piecesWhiteCaptured];
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

    //Reset capture
    this._piecesWhiteCaptured.length = 0;
    this._piecesBlackCaptured.length = 0;

    //Reset position map
    this._previousPositionMap.clear();
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

  //Returns true if a passed index corresponds to a dark colored square.
  private _isDarkColoredSquare(rowIndex: number, fileIndex: number): boolean
  {
    return (rowIndex + fileIndex) % 2 == 1;
  }
  //#endregion

  //#region Game state.

  //Retrieves the game state object.
  public getGameState(): GameState
  {
    const copy = new GameState();

    copy.isGameOver = this._gameState.isGameOver;
    copy.reason = this._gameState.reason;
    copy.winner = this._gameState.winner;
    copy.gameScore = this._gameState.gameScore;

    return copy;
  }

  //Triggers the check to see if the game is over. Updates GameState.
  public checkIsGameOver()
  {
    const nextPlayerHasLegalMoves = this._playerHasLegalMoves(this._turn);
    const playerColor: string = this._turn ? PieceColor.WHITE : PieceColor.BLACK;
    const nextPlayerIsIncheck = this.isInCheck(playerColor)

    //Checkmate
    if (!nextPlayerHasLegalMoves && nextPlayerIsIncheck)
    {
      this._gameState.isGameOver = true;
      this._gameState.reason = GameOverReason.Checkmate;
      this._gameState.winner = PieceColor.getOpposite(playerColor);

      if (playerColor == PieceColor.WHITE)
      {
        this._gameState.gameScore = GameScore.BLACK_WON;
      }
      
      if (playerColor == PieceColor.BLACK)
      {
        this._gameState.gameScore = GameScore.WHITE_WON;
      }
    }

    //Stalemate
    if (!nextPlayerHasLegalMoves && !nextPlayerIsIncheck)
    {
      this._gameState.isGameOver = true;
      this._gameState.reason = GameOverReason.Stalemate;
      this._gameState.gameScore = GameScore.DRAW
    }

    //Insufficient material
    const whitePieceData = this.getAllPiecesAndCoordsByColor(PieceColor.WHITE);
    const blackPieceData = this.getAllPiecesAndCoordsByColor(PieceColor.BLACK);

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
      //Where the white bishop is on the board.
      const whiteBishopCoord: string = whitePieceData.coords[whitePieceData.pieces.findIndex( p => p === PieceType.WHITE_BISHOP )];
      const whiteBishopIndex = ChessConstants.findIndexFromCoordinate(whiteBishopCoord);

      //Where the black bishop is on the board.
      const blackBishopCoord: string = blackPieceData.coords[blackPieceData.pieces.findIndex( p => p === PieceType.BLACK_BISHOP )];
      const blackBishopIndex = ChessConstants.findIndexFromCoordinate(blackBishopCoord);
      
      //What colors the bishops are on.
      const wbIsDark: boolean = this._isDarkColoredSquare(whiteBishopIndex.rowIndex, whiteBishopIndex.colIndex);
      const bbIsDark: boolean = this._isDarkColoredSquare(blackBishopIndex.rowIndex, blackBishopIndex.colIndex);

      //Draw can only happen if the bishops are on the same color.
      if (wbIsDark == bbIsDark)
      {
        isKingAndBishopVsKingAndBishopOnSameColor = true;
      }
    }

    //If any of the four insufficient material conditions are met, then the game is automatically a draw.
    if (isKingVsKing 
      || isKingVsBishopAndKing
      || isKingVsKnightAndKing 
      || isKingAndBishopVsKingAndBishopOnSameColor 
        )
      {
        this._gameState.isGameOver = true;
        this._gameState.gameScore = GameScore.DRAW
        this._gameState.reason = GameOverReason.InsufficientMaterial;
      }

    //fifty moves with no pawn movements or captures
    if (this._halfMovesWithoutPawnMovementsOrCaptures >= Chonse2.DRAW_BY_NO_CAPTURES_OR_PAWN_MOVEMENTS_THRESHOLD)
    {
      this._gameState.isGameOver = true;
      this._gameState.reason = GameOverReason.FiftyMoveNoPawnMovementsOrCaptures;
      this._gameState.gameScore = GameScore.DRAW
    }

    //threefold repetition
    for( let posKey of this._previousPositionMap.keys() )
    {
      const val = this._previousPositionMap.get(posKey);

      if (val)
      {
        if (val >= Chonse2.DRAW_BY_REPETITION_THRESHOLD)
        {
          this._gameState.isGameOver = true;
          this._gameState.reason = GameOverReason.ThreefoldRepetition;
          this._gameState.gameScore = GameScore.DRAW
          break;
        }
      }
    }
    

  }

  //Checks if a pawn can capture en passant (not just that there is an en passant square)
  private _isEnPassantCaptureActuallyPossible() : boolean
  {
    //Logically an en passant capture can't happen if no pawn moved to squares to begin with.
    if (this._enPassantSquare == "")
    {
      return false;
    }

    //The place within the piece state that the en passant square can be found
    let enPassantSquareIndex = ChessConstants.findIndexFromCoordinate(this._enPassantSquare);
    
    //Only run the necessary checks if there is an en passant square.
    if (enPassantSquareIndex)
    {
      //Gets the row so that the pawns next to it can be checked.
      const rankEnPassantPawnIsOn = this._turn ? this._pieceState[enPassantSquareIndex.rowIndex + 1] : this._pieceState[enPassantSquareIndex.rowIndex - 1];

      //The squares that might have pawns that could capture.
      const potentialOpposingPawnLeftSquare = rankEnPassantPawnIsOn[enPassantSquareIndex.colIndex - 1];
      const potentialOpposingPawnRightSquare = rankEnPassantPawnIsOn[enPassantSquareIndex.colIndex + 1];

      //If there are indeed pawns of the color opposing the pawn that just moved two spaces to the left or right, then an en passant capture is possible.
      if (potentialOpposingPawnLeftSquare)
      {
        if (this._turn ? potentialOpposingPawnLeftSquare == PieceType.WHITE_PAWN : potentialOpposingPawnLeftSquare == PieceType.BLACK_PAWN)
        {
          return true;
        }
      }

      if (potentialOpposingPawnRightSquare)
      {
        if (this._turn ? potentialOpposingPawnRightSquare == PieceType.WHITE_PAWN : potentialOpposingPawnRightSquare == PieceType.BLACK_PAWN)
        {
          return true;
        }
      }
    }

    return false; 
  }

  //Position key for tracking draw by repetition
  private _getPositionKey()
  {
    const fenSplit = this.getFEN().split(" ");
    let posKey = "";

    for(let i = 0; i <= Chonse2._FEN_SPLIT_POSKEY_INDEX; i++)
    {
      posKey += fenSplit[i];
      posKey += " ";
    }

    this._isEnPassantCaptureActuallyPossible() ? posKey += this._enPassantSquare : posKey += "-"

    return posKey
  }

  //Stores the most recent move so it can be undone.
  private _cacheState()
  {
    //Turn
    this._stateCache.turn = this._turn;

    //Piece captures
    this._stateCache.piecesWhiteCaptured.length = 0;
    this._stateCache.piecesBlackCaptured.length = 0;
    this._piecesWhiteCaptured.forEach( p => {this._stateCache.piecesWhiteCaptured.push(p)} );
    this._piecesBlackCaptured.forEach( p => {this._stateCache.piecesBlackCaptured.push(p)} );

    //Piece state
    for(let rank = 0; rank < this._pieceState.length; rank++)
    {
      for(let file = 0; file < this._pieceState.length; file++)
      {
        this._stateCache.pieceState[rank][file] = this._pieceState[rank][file];
      }
    }

    //Game state
    this._stateCache.isGameOver = this._gameState.isGameOver;
    this._stateCache.gameOverReason = this._gameState.reason;
    this._stateCache.winner = this._gameState.winner;
    this._stateCache.gameScore = this._gameState.gameScore;

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
    for(const [k, v] of this._previousPositionMap)
    {
      this._stateCache._previousStateMap.set(k, v);
    }
  }

  //#endregion

  //#region Moves

  //Fully validated legal moves that a certain coordinate's piece can make
  public getLegalMoves(coordinate: string): Array<string>
  {
    if (this._gameState.isGameOver)
    {
      return [];
    }

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
    const deepCopy: Chonse2 = this.clone();

    //Out of the available potential legal moves, use dummy moves to see if the player would be in check after. If so, it is not a legal move.
    const legalMoves = potentiallyLegalMoves.filter(item =>
      {
        //Test the dummy move using a stripped-down version
        Chonse2._playDummyMove(deepCopy, coordinate, item);

        //Return true if the player was not in check after the legal move, false if the move would put them in check
        const isKingSafe = this._turn ? !deepCopy.isInCheck(PieceColor.WHITE) : !deepCopy.isInCheck(PieceColor.BLACK);
      
        //Undo the move so that this object can be reused to check the legality of the next
        deepCopy.undoMostRecentMove();

        return isKingSafe;
      }
    )

    return legalMoves;
  }

  //Moves a piece from one spot to another and accounting for promotion if applicable.
  public completeMove(fromCoordinate: string, toCoordinate: string, promotionPiece = PieceType.QUEEN): IMoveResult
  {
    if (this._gameState.isGameOver || fromCoordinate == toCoordinate)
    {
      return {result: false, notation: "", notationMinimal: "" , fromCoord: fromCoordinate, toCoord: toCoordinate, piece: "", pgnComment: "", promotion: ""};
    }

    //Needed to record UCI (making sure that the promo doesn't just get appended to every move).
    let isPromotion = false;

    //In piece state, where the current piece is moving to.
    const toSquareIndex = ChessConstants.findIndexFromCoordinate(toCoordinate);

    //In the piece state, where the current piece is moving from.
    const fromSquareIndex = ChessConstants.findIndexFromCoordinate(fromCoordinate);

    //Extract the piece from the square that is being moved from.
    let piece = this._pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex];

    //So far, potentially legal moves not counting checks.
    const legalMoves = this.getLegalMoves(fromCoordinate); 

    if (!legalMoves.includes(toCoordinate))
    {
      return {result: false, notation: "", notationMinimal: "" , fromCoord: fromCoordinate, toCoord: toCoordinate, piece: piece, pgnComment: "", promotion: ""};
    }

    //Cache the current state in case this object is needed for undoing the most recent move.
    this._cacheState();

    //Begin building algebraic notation for move
    const notation: AlgebraicNotationMaker = new AlgebraicNotationMaker();

    //We know the piece, from square and to square, so we can add it to the notation
    notation.addPiece(piece[1]);
    notation.addFromSquare(fromCoordinate);
    notation.addToSquare(toCoordinate);

    //The piece already present in the square the current piece is moving to (being captured)
    const pieceInToSquare = this._pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex];

    //Used to track the 50 move rule.
    let isPawnMovementOrCapture = false;
    if (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN || pieceInToSquare != PieceType.NONE)
    {
      isPawnMovementOrCapture = true;
    }

    //Handle en passant
    if (toCoordinate == this._enPassantSquare && (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN))
    {
      //Remove the pawn that just got en passant'd
      this._turn ? this._pieceState[toSquareIndex.rowIndex+1][toSquareIndex.colIndex] = "" : this._pieceState[toSquareIndex.rowIndex-1][toSquareIndex.colIndex] = ""; 
    
      //Add the captured piece.
      this._turn ? this._piecesWhiteCaptured.push(PieceType.BLACK_PAWN) : this._piecesBlackCaptured.push(PieceType.WHITE_PAWN);
    
      //Add to notation.
      notation.addCapture();
    }
    //Update the en passant square.
    this._enPassantSquare = this._getEnPassantSquareIfExistsFromTurn(fromCoordinate, toCoordinate, this._turn);

    //handle capture
    if (pieceInToSquare != "")
    {
      //Record it as a capture in the notation
      notation.addCapture();

      //if there was already a piece in the TO square, and the current piece is a black one, then black must be capturing a white piece.
      if (piece.startsWith(PieceColor.BLACK))
      {
        this._piecesBlackCaptured.push(pieceInToSquare);
      }
      
      //vice versa
      if (piece.startsWith(PieceColor.WHITE))
      {
        this._piecesWhiteCaptured.push(pieceInToSquare);
      }
    }

    //Handle promotion
    if (
      piece == PieceType.WHITE_PAWN && toCoordinate.includes(ChessConstants.WHITE_PAWN_PROMOTE_RANK.toString()) ||
      piece == PieceType.BLACK_PAWN && toCoordinate.includes(ChessConstants.BLACK_PAWN_PROMOTE_RANK.toString()))
    {
      //record it in the notation
      notation.addPromotion(promotionPiece);
      isPromotion = true;
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

      //set promoted piece
      this._pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;
    }
    
    //Clear the old piece position.
    this._pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex] = "";

    //Replace it in the new position.
    this._pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;

    //If the player castled kingside (check that the from and to coordinates match a kingside castle).
    if (this._turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == ChessConstants.WHITE_KING_SQUARE && toCoordinate == ChessConstants.WHITE_KINGSIDE_KNIGHT_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == ChessConstants.BLACK_KING_SQUARE && toCoordinate == ChessConstants.BLACK_KINGSIDE_KNIGHT_SQUARE))
    {
      //If they do, check that they actually have castling rights for the king side.
      if (piece == PieceType.WHITE_KING ? this._whiteCastlingRights.kingSide : this._blackCastlingRights.kingSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_KINGSIDE_BISHOP_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_KINGSIDE_BISHOP_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_KINGSIDE_ROOK_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_KINGSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        this._pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        this._pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;

        //Removes castling rights as a player cannot castle multiple times.
        piece == PieceType.WHITE_KING ? this._whiteCastlingRights.removeBothCastlingRights() : this._blackCastlingRights.removeBothCastlingRights();
      
        //Record castling move in notation.
        notation.addKingsideCastle();
      }
    }

    //If the player castled queenside (check that the from and to coordinates match a queenside castle).
    if (this._turn == true ? 
      (piece == PieceType.WHITE_KING && fromCoordinate == ChessConstants.WHITE_KING_SQUARE && toCoordinate == ChessConstants.WHITE_QUEENSIDE_BISHOP_SQUARE) 
      : (piece == PieceType.BLACK_KING && fromCoordinate == ChessConstants.BLACK_KING_SQUARE && toCoordinate == ChessConstants.BLACK_QUEENSIDE_BISHOP_SQUARE))
    {
      //If they do, check that they actually have castling rights for the queen side.
      if (piece == PieceType.WHITE_KING ? this._whiteCastlingRights.queenSide : this._blackCastlingRights.queenSide)
      {
        //Where the rook will when the player castles.
        const newRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_QUEEN_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_QUEEN_SQUARE);
        
        //Where the old rook will be cleared.
        const oldRookPlaceIndex = piece == PieceType.WHITE_KING ? ChessConstants.findIndexFromCoordinate(ChessConstants.WHITE_QUEENSIDE_ROOK_SQUARE) : ChessConstants.findIndexFromCoordinate(ChessConstants.BLACK_QUEENSIDE_ROOK_SQUARE);
        
        //The piece to replace it with (a white rook if white is castling, black otherwise).
        const newRook = piece == PieceType.WHITE_KING ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

        //Clears the old rook place.
        this._pieceState[oldRookPlaceIndex.rowIndex][oldRookPlaceIndex.colIndex] = PieceType.NONE;

        //Sets the new rook in place (protecting the king).
        this._pieceState[newRookPlaceIndex.rowIndex][newRookPlaceIndex.colIndex] = newRook;

        //Removes castling rights as a player cannot castle multiple times.
        piece == PieceType.WHITE_KING ? this._whiteCastlingRights.removeBothCastlingRights() : this._blackCastlingRights.removeBothCastlingRights();
      
        //Record castling move in notation.
        notation.addQueensideCastle();
      }
    }
    
    //If the player moved their king, strip castling rights on both sides.
    if (this._turn == true ? piece == PieceType.WHITE_KING : piece == PieceType.BLACK_KING)
    {
      this._turn == true ? this._whiteCastlingRights.removeBothCastlingRights() : this._blackCastlingRights.removeBothCastlingRights();
    }
  
    //If the player moved their rook, remove castling rights for that side.
    if (this._turn == true ? piece == PieceType.WHITE_ROOK : piece == PieceType.BLACK_ROOK)
    {
      if (this._turn && fromCoordinate == ChessConstants.WHITE_KINGSIDE_ROOK_SQUARE)
      {
        this._whiteCastlingRights.kingSide = false;
      }

      if (this._turn && fromCoordinate == ChessConstants.WHITE_QUEENSIDE_ROOK_SQUARE)
      {
        this._whiteCastlingRights.queenSide = false;
      }

      if (!this._turn && fromCoordinate == ChessConstants.BLACK_KINGSIDE_ROOK_SQUARE)
      {
        this._blackCastlingRights.kingSide = false;
      }

      if (!this._turn && fromCoordinate == ChessConstants.BLACK_QUEENSIDE_ROOK_SQUARE)
      {
        this._blackCastlingRights.queenSide = false;
      }
    }

    //If the player had that rook captured, remove castling rights for that side
    if (this._turn && toCoordinate == ChessConstants.BLACK_KINGSIDE_ROOK_SQUARE)
    {
      this._blackCastlingRights.kingSide = false;
    }

    if (this._turn && toCoordinate == ChessConstants.BLACK_QUEENSIDE_ROOK_SQUARE)
    {
      this._blackCastlingRights.queenSide = false;
    }

    if (!this._turn && toCoordinate == ChessConstants.WHITE_KINGSIDE_ROOK_SQUARE)
    {
      this._whiteCastlingRights.kingSide = false;
    }

    if (!this._turn && toCoordinate == ChessConstants.WHITE_QUEENSIDE_ROOK_SQUARE)
    {
      this._whiteCastlingRights.queenSide = false;
    }

    //If black just moved, increase counter of full moves.
    if (!this._turn)
    {
      this._fullMoveCounter++;
    }

    //If it was a move or a pawn capture, reset the draw counter. If not, increment it.
    if (!isPawnMovementOrCapture)
    {
      this._halfMovesWithoutPawnMovementsOrCaptures++;
    }
    else
    {
      this._halfMovesWithoutPawnMovementsOrCaptures = 0;
    }

    //Once this player finishes their move, it's the next person's turn.
    this._turn = !this._turn;

    //Track this position in the state map.
    const currentPosKey = this._getPositionKey()
    const currentStateCount: number | undefined = this._previousPositionMap.get(currentPosKey);
    if (!currentStateCount)
    {
      this._previousPositionMap.set(currentPosKey, 1);
    }
    else
    {
      this._previousPositionMap.set(currentPosKey, currentStateCount + 1);
    }

    //check for checkmate, stalemate, etc
    this.checkIsGameOver();

    //If there is a checkmate, append it to the notation.
    if (this._gameState.isGameOver && this._gameState.reason == GameOverReason.Checkmate)
    {
      notation.addMate();
    }
    else //If there isn't, verify if there is just a check and add it if applicable.
    {
      const nextPlayerIsIncheck = this.isInCheck(this._turn ? PieceColor.WHITE : PieceColor.BLACK);
      if (nextPlayerIsIncheck)
      {
        notation.addCheck();
      }
    }

    //The move was successful if we got this far.
    return {result: true, notation: notation.get(), notationMinimal: notation.getMinimal(this, toCoordinate, piece) ,fromCoord: fromCoordinate, toCoord: toCoordinate, piece: piece, pgnComment: "", promotion: isPromotion ? promotionPiece : ""};
  }

  //Clears state cache and reverts it completely to that of the previous move.
  public undoMostRecentMove()
  {
    //Turn
    this._turn = this._stateCache.turn;

    //Piece captures
    this._piecesWhiteCaptured.length = 0;
    this._piecesBlackCaptured.length = 0;
    this._stateCache.piecesWhiteCaptured.forEach(p => { this._piecesWhiteCaptured.push(p); });
    this._stateCache.piecesBlackCaptured.forEach(p => { this._piecesBlackCaptured.push(p); });

    //piece state
    for(let rank = 0; rank < this._stateCache.pieceState.length; rank++)
    {
      for(let file = 0; file < this._stateCache.pieceState.length; file++)
      {
        this._pieceState[rank][file] = this._stateCache.pieceState[rank][file];
      }
    }

    //game state
    this._gameState.isGameOver = this._stateCache.isGameOver;
    this._gameState.reason = this._stateCache.gameOverReason;
    this._gameState.winner = this._stateCache.winner;
    this._gameState.gameScore = this._stateCache.gameScore;

    //Castling rights
    this._whiteCastlingRights.kingSide = this._stateCache.whiteKingsideCastlingRights;
    this._whiteCastlingRights.queenSide = this._stateCache.whiteQueensideCastlingRights;
    this._blackCastlingRights.kingSide = this._stateCache.blackKingsideCastlingRights;
    this._blackCastlingRights.queenSide = this._stateCache.blackQueensideCastlingRights;

    //Move counters
    this._halfMovesWithoutPawnMovementsOrCaptures = this._stateCache.halfMovesWithoutPawnMovementsOrCaptures;
    this._fullMoveCounter = this._stateCache.fullMoveCounter;

    //Previous fen key
    this._previousPositionMap.clear();

    for(const [k, v] of this._stateCache._previousStateMap)
    {
      this._previousPositionMap.set(k, v);
    }
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
  private static _playDummyMove(inst: Chonse2, fromCoordinate: string, toCoordinate: string)
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
    
      //Add the captured piece.
      inst._turn ? inst._piecesWhiteCaptured.push(PieceType.BLACK_PAWN) : inst._piecesBlackCaptured.push(PieceType.WHITE_PAWN);
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
  public getEnPassantSquare()
  {
    return this._enPassantSquare;
  }

  //Sets en passant square to the passed coord.
  public setEnPassantSquare(coord: string)
  {
    this._enPassantSquare = coord;
  }

  private _getEnPassantSquareIfExistsFromTurn(fromSquare: string, toSquare: string, turn: boolean) : string
  {
    //En passant moves are stored with key fromsquare-tosquare
    const key = fromSquare + "-" + toSquare;

    //Gets the en passant square corresponding to the double pawn move if it exists.
    const val = turn ? Chonse2._WHITE_EP_TRIGGERS.get(key) : Chonse2._BLACK_EP_TRIGGERS.get(key);

    //Return it if it exists or empty string otherwise.
    return val == null ? "" : val;
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
    const obj = new Chonse2();
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
                  FenHelper.getPieceFromFenPiece(char);

              col++;
            }
        }
      }

      //active color
      obj._turn = turn === PieceColor.WHITE ? true : false;

      //castling
      const castling = FenHelper.getCastlingRightsFromFen(castlingRights);
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
  public clone(): Chonse2
  {
    const copy = new Chonse2();

    //captures/material
    copy._piecesWhiteCaptured = structuredClone(this._piecesWhiteCaptured);
    copy._piecesBlackCaptured = structuredClone(this._piecesBlackCaptured);

    //pieces
    copy._pieceState = structuredClone(this._pieceState);

    //game state
    const gameStateCopy = new GameState();
    gameStateCopy.isGameOver = this._gameState.isGameOver;
    gameStateCopy.reason = this._gameState.reason;
    copy._gameState = gameStateCopy;

    //turn
    copy._turn = this._turn;

    //en passant
    copy._enPassantSquare = this._enPassantSquare;

    //castling rights
    copy._whiteCastlingRights = new CastlingRights();
    copy._whiteCastlingRights.kingSide = this._whiteCastlingRights.kingSide;
    copy._whiteCastlingRights.queenSide = this._whiteCastlingRights.queenSide;

    copy._blackCastlingRights = new CastlingRights();
    copy._blackCastlingRights.kingSide = this._blackCastlingRights.kingSide; 
    copy._blackCastlingRights.queenSide = this._blackCastlingRights.queenSide;

    //move counters
    copy._halfMovesWithoutPawnMovementsOrCaptures = this._halfMovesWithoutPawnMovementsOrCaptures;
    copy._fullMoveCounter = this._fullMoveCounter;

    //state tracker
    copy._previousPositionMap = structuredClone(this._previousPositionMap);

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
          fen += FenHelper.getFenPieceFromPiece(currentSquareContent);
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
    fen += FenHelper.getFenCastlingRights(this._whiteCastlingRights, this._blackCastlingRights);

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

//Used to cache the state one move ago.
class PreviousStateCache
{
  //captures
  piecesWhiteCaptured: string[] = [];
  piecesBlackCaptured: string[] = [];

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

  //game state
  isGameOver: boolean = false;
  gameOverReason: GameOverReason = GameOverReason.None;
  winner: string = "";
  gameScore: string = GameScore.IN_PROGRESS;

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

  //arrays
  copy.piecesWhiteCaptured = [...this.piecesWhiteCaptured];
  copy.piecesBlackCaptured = [...this.piecesBlackCaptured];

  //2D board array
  copy.pieceState = this.pieceState.map(row => [...row]);

  //primitives
  copy.isGameOver = this.isGameOver;
  copy.gameOverReason = this.gameOverReason;
  copy.winner = this.winner;
  copy.gameScore = this.gameScore;

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