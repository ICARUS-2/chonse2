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

  //LEGAL MOVE INFO
  static WHITE_PAWN_RANK = 2;
  static BLACK_PAWN_RANK = 7;

  //PIECES ON THE BOARD CURRENTLY
  @Input() pieceState: Array<Array<string>> = Chessboard.DEFAULT_PIECE_STATE;
  
  //MOVE PROPERTIES
  currentLegalMoves: string[] = [];
  currentlyHeldPiece: string = "";
  fromSquare: string = "";
  toSquare: string = "";

  //CAPTURE PROPERTIES
  piecesWhiteCaptured: string[] = [];
  piecesBlackCaptured: string[] = [];

  //COSMETIC
  mouseX: number = 0;
  mouseY: number = 0;

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

  onSquareMouseDown(event: { coordinate: string, piece: string, mouse: MouseEvent })
  {
    //update the square that the piece is dragged from
    this.fromSquare = event.coordinate;
    this.currentlyHeldPiece = event.piece;

    if (event.piece != "")
    {
      this.handleDragImage(event.mouse);
    }    

    this.currentLegalMoves = this.getLegalMoves(event.coordinate, event.piece);
  }

  onSquareMouseUp(event: { coordinate: string })
  {
    this.toSquare = event.coordinate;

    this.completeMove(this.fromSquare, this.toSquare, this.currentlyHeldPiece);

    this.fromSquare = "";
    this.toSquare = "";
    this.currentLegalMoves = [];
  }

  handleDragImage(mouse: MouseEvent)
  {
    this.mouseX = mouse.clientX;
    this.mouseY = mouse.clientY;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp)
  }

  onMouseMove = (event: MouseEvent) => 
  {
    this.mouseX = event.clientX; 
    this.mouseY = event.clientY;
  }

  onMouseUp = (event: MouseEvent) => 
  {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.currentlyHeldPiece = "";
    this.mouseX = 0;
    this.mouseY = 0;
  }

  getLegalMoves(coordinate: string, piece: string): Array<string>
  {
    //rowIndex is the rank, colIndex is the file.
    const {rowIndex, colIndex} = this.findIndexFromCoordinate(coordinate);

    const fileLetter = coordinate[0];
    const rankNumber = Number(coordinate[1]);

    const legalMoves = [];

    switch(piece)
    {
      case PieceType.NONE:
        return [];
      
      //WHITE PIECES=======================
      case PieceType.WHITE_PAWN:

        //if a pawn is on its starting position, it can move either one or two squares.
        if (rankNumber === Chessboard.WHITE_PAWN_RANK)
        {
          const rankAbove = this.pieceState.at(Chessboard.WHITE_PAWN_RANK + 1);
          const twoRanksAbove = this.pieceState.at(Chessboard.WHITE_PAWN_RANK + 2);

          if (rankAbove && twoRanksAbove)
          {
            const squareAbove = rankAbove.at(colIndex);
            const twoSquaresAbove = twoRanksAbove.at(colIndex);

            if (squareAbove == "")
            {
              legalMoves.push(this.COORDS[rowIndex - 1][colIndex]);

              if (twoSquaresAbove == "")
              {
                legalMoves.push(this.COORDS[rowIndex - 2][colIndex]);
              }
            }
          }
        }
        else
        {

        }
        break;

      case PieceType.WHITE_ROOK:
        //
        break;

      case PieceType.WHITE_KNIGHT:
        //
        break;

      case PieceType.WHITE_BISHOP:
        //
        break;

      case PieceType.WHITE_QUEEN:
        //
        break;

      case PieceType.WHITE_KING:
        //
        break;

      //BLACK PIECES
      case PieceType.BLACK_PAWN:
        //
        break;

      case PieceType.BLACK_ROOK:
        //
        break;

      case PieceType.BLACK_KNIGHT:
        //
        break;

      case PieceType.BLACK_BISHOP:
        //
        break;

      case PieceType.BLACK_QUEEN:
        //
        break;

      case PieceType.BLACK_KING:
        //
        break;
    }

    return legalMoves;
  }

  completeMove(fromCoordinate: string, toCordinate: string, piece: string): boolean
  {
    if (!this.currentLegalMoves.includes(toCordinate))
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
      if (piece.startsWith("w"))
      {
        this.piecesBlackCaptured.push(pieceInToSquare);
      }
      
      if (piece.startsWith("b"))
      {
        this.piecesWhiteCaptured.push(pieceInToSquare);
      }
    }

    //Clear the old piece position.
    this.pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex] = "";

    //Replace it in the new position.
    this.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;
    

    return true;
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
