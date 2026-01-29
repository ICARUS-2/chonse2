import { Component, Input, OnInit } from '@angular/core';
import { PieceType } from '../piece-type';
import { Square } from '../square/square';
import { PieceColor } from '../piece-color';
import { CapturedPieces } from "../captured-pieces/captured-pieces";
import PieceMaterial from '../piece-material';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PromotionModal } from '../../promotion-modal/promotion-modal';

@Component({
  selector: 'app-chessboard',
  imports: [Square, CapturedPieces],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
})
export class Chessboard implements OnInit {
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

  //CONSTANTS
  static WHITE_PAWN_RANK = 2;
  static BLACK_PAWN_RANK = 7;
  static WHITE_PAWN_PROMOTE_RANK = 8;
  static BLACK_PAWN_PROMOTE_RANK = 1;
  static SIZE: number = 8;

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
  promotionalMaterialDifference: number = 0;

  //COSMETIC
  mouseX: number = 0;
  mouseY: number = 0;

  constructor(private modalService: NgbModal)
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

  //MOUSE LOGIC
  //#region 
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
  //#endregion

  getLegalMoves(coordinate: string, piece: string): Array<string>
  {
    let legalMoves: Array<string> = [];

    //handle pawn
    if (piece == PieceType.WHITE_PAWN || piece == PieceType.BLACK_PAWN)
    {
      legalMoves = this._getLegalPawnMoves(coordinate, piece);
    }

    //handle knight
    if (piece == PieceType.WHITE_KNIGHT || piece == PieceType.BLACK_KNIGHT)
    {
      legalMoves = this._getLegalKnightMoves(coordinate, piece);
    }

    if (piece == PieceType.WHITE_BISHOP || piece == PieceType.BLACK_BISHOP)
    {
      //
    }

    //handle rook
    if (piece == PieceType.WHITE_ROOK || piece == PieceType.BLACK_ROOK)
    {
      legalMoves = this._getLegalRookMoves(coordinate, piece);
    }

    //handle queen
    if (piece == PieceType.WHITE_QUEEN || piece == PieceType.BLACK_QUEEN)
    {
      //
    }

    //handle king
    if (piece == PieceType.WHITE_QUEEN || piece == PieceType.BLACK_KING)
    {
      //
    }

    return legalMoves;
  }

  _getLegalPawnMoves(coordinate: string, piece: string): Array<string>
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
        piece == PieceType.WHITE_PAWN ? legalMoves.push(this.COORDS[rowIndex - 1][colIndex]) : legalMoves.push(this.COORDS[rowIndex + 1][colIndex]);
      }

      //if this column is not the leftmost one, then it can potentially capture a piece left-diagonally.
      if (colIndex != 0)
      {
        const leftCaptureSquare = rankAbove.at(colIndex - 1);

        if (leftCaptureSquare?.startsWith(piece == PieceType.WHITE_PAWN ? PieceColor.BLACK : PieceColor.WHITE))
        {
          piece == PieceType.WHITE_PAWN ? legalMoves.push(this.COORDS[rowIndex - 1][colIndex - 1]) : legalMoves.push(this.COORDS[rowIndex + 1][colIndex - 1]);
        }
      }

      //if this column is not the rightmost one, then it can potentially capture a piece right-diagonally.
      if (colIndex != rankAbove.length - 1)
      {
        const rightCaptureSquare = rankAbove.at(colIndex + 1);

        if (rightCaptureSquare?.startsWith(piece == PieceType.WHITE_PAWN ? PieceColor.BLACK : PieceColor.WHITE))
        {
          piece == PieceType.WHITE_PAWN ? legalMoves.push(this.COORDS[rowIndex - 1][colIndex + 1]) : legalMoves.push(this.COORDS[rowIndex + 1][colIndex + 1]);;
        }
      }

      if (piece == PieceType.WHITE_PAWN ? rankNumber == Chessboard.WHITE_PAWN_RANK : rankNumber === Chessboard.BLACK_PAWN_RANK)
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
            piece == PieceType.WHITE_PAWN ? legalMoves.push(this.COORDS[rowIndex - 2][colIndex]) : legalMoves.push(this.COORDS[rowIndex + 2][colIndex]);;
          }
        }
      }
    }
    return legalMoves;
  }

  _getLegalKnightMoves(coordinate: string, piece: string) : Array<string>
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
            legalMoves.push(this.COORDS[rowIndex + dRow[i]][colIndex + dCol[i]]);
          }
        }
      }

    }

    

    return legalMoves;
  }
  
  _getLegalRookMoves(coordinate: string, piece: string): Array<string>
  {
    if (piece != PieceType.WHITE_ROOK && piece != PieceType.BLACK_ROOK)
    {
      return [];
    }

    const {rowIndex, colIndex} = this.findIndexFromCoordinate(coordinate);
    const legalMoves = [];

    //a rook can move left or right on its current rank
    const currentRank = this.pieceState.at(rowIndex);

    if (currentRank)
    {
      //checks for moves to the right.
      for(let i = colIndex + 1; i < Chessboard.SIZE; i++)
      {
        //A possible rook move can have three cases: The square is empty, the square has an enemy piece, or an ally piece.
        const potentialMove = this.pieceState[rowIndex][i];

        //If the square is empty, it can move there.
        if (potentialMove == "")
        {
          legalMoves.push(this.COORDS[rowIndex][i]);
        }

        //If the square has an enemy on it, this is the last place it can go in that direction (and capture)
        if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.BLACK : PieceColor.WHITE))
        {
          legalMoves.push(this.COORDS[rowIndex][i]);
          break;
        }

        //If the square has an ally piece, it can move no further.
        if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.WHITE : PieceColor.BLACK))
        {
          break;
        }
      }

      for (let i = colIndex - 1; i >= 0; i--)
      {
        //A possible rook move can have three cases: The square is empty, the square has an enemy piece, or an ally piece.
        const potentialMove = this.pieceState[rowIndex][i];

        //If the square is empty, it can move there.
        if (potentialMove == "")
        {
          legalMoves.push(this.COORDS[rowIndex][i]);
        }

        //If the square has an enemy on it, this is the last place it can go in that direction (and capture)
        if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.BLACK : PieceColor.WHITE))
        {
          legalMoves.push(this.COORDS[rowIndex][i]);
          break;
        }

        //If the square has an ally piece, it can move no further.
        if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.WHITE : PieceColor.BLACK))
        {
          break;
        }
      }
    }

    for (let i = rowIndex + 1; i < Chessboard.SIZE; i++)
    {
      //A possible rook move can have three cases: The square is empty, the square has an enemy piece, or an ally piece.
      const potentialMove = this.pieceState[i][colIndex];

      //If the square is empty, it can move there.
      if (potentialMove == "")
      {
        legalMoves.push(this.COORDS[i][colIndex]);
      }

      //If the square has an enemy on it, this is the last place it can go in that direction (and capture)
      if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.BLACK : PieceColor.WHITE))
      {
        legalMoves.push(this.COORDS[i][colIndex]);
        break;
      }

      //If the square has an ally piece, it can move no further.
      if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.WHITE : PieceColor.BLACK))
      {
        break;
      }
    }

    for (let i = rowIndex - 1; i >=0; i--)
    {
      //A possible rook move can have three cases: The square is empty, the square has an enemy piece, or an ally piece.
      const potentialMove = this.pieceState[i][colIndex];

      //If the square is empty, it can move there.
      if (potentialMove == "")
      {
        legalMoves.push(this.COORDS[i][colIndex]);
      }

      //If the square has an enemy on it, this is the last place it can go in that direction (and capture)
      if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.BLACK : PieceColor.WHITE))
      {
        legalMoves.push(this.COORDS[i][colIndex]);
        break;
      }

      //If the square has an ally piece, it can move no further.
      if (potentialMove.startsWith(piece == PieceType.WHITE_ROOK ? PieceColor.WHITE : PieceColor.BLACK))
      {
        break;
      }
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
      piece == PieceType.WHITE_PAWN && toCordinate.includes(Chessboard.WHITE_PAWN_PROMOTE_RANK.toString()) ||
      piece == PieceType.BLACK_PAWN && toCordinate.includes(Chessboard.BLACK_PAWN_PROMOTE_RANK.toString()))
    {
      //Opens the promotion window.
      const modalRef = this.modalService.open(PromotionModal, {size: "xl"});

      //Passes the correct color into it.
      const promotionPieceColor = piece == PieceType.WHITE_PAWN ? PieceColor.WHITE : PieceColor.BLACK;
      modalRef.componentInstance.color = promotionPieceColor;

      modalRef.result.then( (result) =>
      {
        //If the user manually selected something, promote to that piece.
        piece = result;
      } )
      .catch( () =>
      {
        //If the user closed the modal, auto-promote to queen.
        piece = (piece == PieceType.WHITE_PAWN) ? PieceType.WHITE_QUEEN : PieceType.BLACK_QUEEN;
      } )
      .finally( () => 
        {    
          //Change the piece for the promoted one and update material difference.
          if (piece.startsWith(PieceColor.WHITE))
          {
            this.promotionalMaterialDifference += PieceMaterial.getMaterialFromPiece(piece) - 1; //+1 accounts for the loss of pawn.
          }
          else
          {
            this.promotionalMaterialDifference -= PieceMaterial.getMaterialFromPiece(piece) + 1;
          }
          this.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;} 
        )
    }

    //Clear the old piece position.
    this.pieceState[fromSquareIndex.rowIndex][fromSquareIndex.colIndex] = "";

    //Replace it in the new position.
    this.pieceState[toSquareIndex.rowIndex][toSquareIndex.colIndex] = piece;
    
    return true;
  }

  findIndexFromCoordinate(coordinate: string) : { rowIndex: number, colIndex: number }
  {
    //Finds the row that includes this coordinate.
    const rIdx = this.COORDS.findIndex( row => row.includes(coordinate) );

    //If it doesn't exist, it should return -1.
    if (rIdx === -1)
    {
      return { rowIndex: -1, colIndex: -1 };
    }

    //The column index is the place in the rank where that exact coordinate is found.
    const cIdx = this.COORDS[rIdx].findIndex( col => col === coordinate );

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
    }
    )

    return whiteMaterialCaptured - blackMaterialCaptured + this.promotionalMaterialDifference;
  }
}
