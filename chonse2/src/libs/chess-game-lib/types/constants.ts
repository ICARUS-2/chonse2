import { PieceType } from "./piece-type";

export class ChessConstants
{
  //Standard chess starting position.
  static readonly DEFAULT_PIECE_STATE: ReadonlyArray<ReadonlyArray<string>> =
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

  //Board with nothing but two kings.
  static readonly CLEARED_BOARD: ReadonlyArray<ReadonlyArray<string>> =   
  [
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.BLACK_KING, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.WHITE_KING, PieceType.NONE, PieceType.NONE, PieceType.NONE]
  ];

  //Standard coordinates on a board.
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
  
  //Gets the index from a piece array.
  static findIndexFromCoordinate(coordinate: string) : { rowIndex: number, colIndex: number }
  {
    //Finds the row that includes this coordinate.
    const rIdx = ChessConstants.COORDS.findIndex( row => row.includes(coordinate) );

    //If it doesn't exist, it should return -1.
    if (rIdx === -1)
    {
      return { rowIndex: -1, colIndex: -1 };
    }

    //The column index is the place in the rank where that exact coordinate is found.
    const cIdx = ChessConstants.COORDS[rIdx].findIndex( col => col === coordinate );

    //Both row and column indeces are returned.
    return {rowIndex: rIdx, colIndex: cIdx};
  }
  
  static readonly SIZE: number = 8;

  //ranks
  static readonly WHITE_PAWN_RANK = 2;
  static readonly BLACK_PAWN_RANK = 7;
  static readonly WHITE_PAWN_PROMOTE_RANK = 8;
  static readonly BLACK_PAWN_PROMOTE_RANK = 1;

  //squares (pieces)
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

  //squares (pawns)
  static readonly WHITE_QUEENSIDE_ROOK_PAWN_SQUARE = "a2";
  static readonly WHITE_QUEENSIDE_KNIGHT_PAWN_SQUARE = "b2";
  static readonly WHITE_QUEENSIDE_BISHOP_PAWN_SQUARE = "c2";
  static readonly WHITE_QUEEN_PAWN_SQUARE = "d2";
  static readonly WHITE_KING_PAWN_SQUARE = "e2";
  static readonly WHITE_KINGSIDE_BISHOP_PAWN_SQUARE = "f2";
  static readonly WHITE_KINGSIDE_KNIGHT_PAWN_SQUARE = "g2";
  static readonly WHITE_KINGSIDE_ROOK_PAWN_SQUARE = "h2";

  static readonly BLACK_QUEENSIDE_ROOK_PAWN_SQUARE = "a7";
  static readonly BLACK_QUEENSIDE_KNIGHT_PAWN_SQUARE = "b7";
  static readonly BLACK_QUEENSIDE_BISHOP_PAWN_SQUARE = "c7";
  static readonly BLACK_QUEEN_PAWN_SQUARE = "d7";
  static readonly BLACK_KING_PAWN_SQUARE = "e7";
  static readonly BLACK_KINGSIDE_BISHOP_PAWN_SQUARE = "f7";
  static readonly BLACK_KINGSIDE_KNIGHT_PAWN_SQUARE = "g7";
  static readonly BLACK_KINGSIDE_ROOK_PAWN_SQUARE = "h7";

  //Center
  static readonly CENTER_SQUARES = ["d4", "e4", "d5", "e5"];

  //Move vectors.
  public static readonly BISHOP_VECTOR_X = [-1, -1, 1, 1];
  public static readonly BISHOP_VECTOR_Y = [-1, 1, -1, 1];
  public static readonly ROOK_VECTOR_X = [-1, 1, 0, 0];
  public static readonly ROOK_VECTOR_Y = [0, 0, -1, 1];
  public static readonly QUEEN_KING_VECTOR_X = [-1, 1, 0, 0, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, -1, 1, 1];
  public static readonly QUEEN_KING_VECTOR_Y = [0, 0, -1, 1, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, 1, -1, 1];

  //Draw conditions
  public static readonly DRAW_BY_NO_CAPTURES_OR_PAWN_MOVEMENTS_THRESHOLD = 100; //50 full moves * 2
  public static readonly DRAW_BY_REPETITION_THRESHOLD: number = 3;

  //Promotions
  public static readonly PROMOTIONS = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT];
}