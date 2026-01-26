import { Component, Input, OnInit } from '@angular/core';
import { PieceType } from '../piece-type';
import { Square } from '../square/square';

@Component({
  selector: 'app-chessboard',
  imports: [Square],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
})
export class Chessboard implements OnInit {
  static SIZE: number = 8;
  static DEFAULT_PIECE_STATE: Array<Array<string>> = [
      [ PieceType.BLACK_ROOK, PieceType.BLACK_KNIGHT, PieceType.BLACK_BISHOP, PieceType.BLACK_QUEEN, PieceType.BLACK_KING, PieceType.BLACK_BISHOP,PieceType.BLACK_KNIGHT, PieceType.BLACK_ROOK],
      [ PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN, PieceType.BLACK_PAWN],
      [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
      [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
      [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
      [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
      [ PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN, PieceType.WHITE_PAWN],
      [ PieceType.WHITE_ROOK, PieceType.WHITE_KNIGHT, PieceType.WHITE_BISHOP, PieceType.WHITE_QUEEN, PieceType.WHITE_KING, PieceType.WHITE_BISHOP, PieceType.WHITE_KNIGHT, PieceType.WHITE_ROOK]
  ];

  COORDS: Array<Array<string>> = [
    ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
    ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
    ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
    ["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
    ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
    ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
    ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
    ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
];


  @Input() pieceState: Array<Array<string>> = Chessboard.DEFAULT_PIECE_STATE;

  mouseUpField: string = "";
  mouseDownField: string = "";

  constructor()
  {

  }

  ngOnInit(): void {
        //validates correct number of ranks.
    if (this.pieceState.length != Chessboard.SIZE)
    {
      throw("BOARD SHOULD BE OF SIZE " + Chessboard.SIZE);
    }

    //validates correct number of files per rank.
    this.pieceState.forEach( rank => 
    {
      if (rank.length != Chessboard.SIZE)
      {
        throw("BOARD SHOULD BE OF SIZE " + Chessboard.SIZE);
      }
    });
  }

  onSquareMouseDown(event: { coordinate: string, piece: string })
  {
    this.mouseDownField = event.coordinate + " " + event.piece;
  }

  onSquareMouseUp(event: { coordinate: string, piece: string })
  {
    this.mouseUpField = event.coordinate + " " + event.piece;
  }

  getLegalMoves(coordinate: string)
  {
    const {rowIndex, colIndex} = this.findIndexFromCoordinate(coordinate);
  }

  findIndexFromCoordinate(coordinate: string) : { rowIndex: number, colIndex: number }
  {
    const rIdx = this.COORDS.findIndex( row => row.includes(coordinate) );

    if (rIdx === -1)
    {
      return { rowIndex: -1, colIndex: -1 };
    }

    const cIdx = this.COORDS[rIdx].findIndex( col => col === coordinate );

    return {rowIndex: rIdx, colIndex: cIdx};
  }
}
