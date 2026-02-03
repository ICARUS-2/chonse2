import { Component, Input, OnInit } from '@angular/core';
import { PieceType } from '../../../lib/piece-type';
import { Square } from '../square/square';
import { PieceColor } from '../../../lib/piece-color';
import { CapturedPieces } from "../captured-pieces/captured-pieces";
import PieceMaterial from '../../../lib/piece-material';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PromotionModal } from '../../promotion-modal/promotion-modal';
import Chonse2 from '../../../lib/chonse2';
import CastlingRights from '../../../lib/castling-rights';

@Component({
  selector: 'app-chessboard',
  imports: [Square, CapturedPieces],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
})
export class Chessboard implements OnInit {

  COORDS: Array<Array<string>> = Chonse2.COORDS;

  //PIECES ON THE BOARD CURRENTLY
  @Input() chessGame: Chonse2 = new Chonse2();
  
  //MOVE PROPERTIES
  currentLegalMoves: string[] = [];
  currentlyHeldPiece: string = "";
  fromSquare: string = "";
  toSquare: string = "";

  //COSMETIC
  mouseX: number = 0;
  mouseY: number = 0;
  isFlipped: boolean = false;

  constructor(private modalService: NgbModal)
  {

  }

  ngOnInit(): void {

  }

  //MOUSE LOGIC
  //#region 
  onSquareMouseDown(event: { coordinate: string, piece: string, mouse: MouseEvent })
  {
    if (event.mouse.button != 0)
    {
      return;
    }

    //update the square that the piece is dragged from
    this.fromSquare = event.coordinate;
    this.currentlyHeldPiece = event.piece;

    if (event.piece != "")
    {
      this.handleDragImage(event.mouse);
    }    

    this.currentLegalMoves = this.chessGame.getLegalMoves(event.coordinate);
  }

  onSquareMouseUp(event: { coordinate: string })
  {
    //sets the square in the UI to where the player is dropping the piece.
    this.toSquare = event.coordinate;

    const fromSquare = this.fromSquare;
    const toSquare = event.coordinate;
    const piece = this.currentlyHeldPiece;

    if (!this.currentLegalMoves.includes(toSquare))
    {
      return;
    }
    
    const isPromotion = (
      this.currentlyHeldPiece == PieceType.WHITE_PAWN && this.toSquare.includes(Chonse2.WHITE_PAWN_PROMOTE_RANK.toString()) ||
      this.currentlyHeldPiece == PieceType.BLACK_PAWN && this.toSquare.includes(Chonse2.BLACK_PAWN_PROMOTE_RANK.toString()))

    //handle pawn promotion if the pawn is at the opposite rank=.
    if (isPromotion)
    {
      //color to show on the dialog is derived.
      const promotionPieceColor = this.currentlyHeldPiece == PieceType.WHITE_PAWN ? PieceColor.WHITE : PieceColor.BLACK;

      //open the modal and set the color.
      const modalRef = this.modalService.open(PromotionModal, {size: 'xl'});
      modalRef.componentInstance.color = promotionPieceColor;

      //gets the result of that dialog.
      modalRef.result.then( (result) =>
      {
        //perform the move and promote to what the user selected.
        this.chessGame.completeMove(fromSquare, toSquare, result);
      } )
      .catch( () =>
      {
        //if the dialog was forced closed, promote to queen by default.
        this.chessGame.completeMove(fromSquare, toSquare, PieceType.QUEEN);
      } )
      .finally()
      {
        //Resets the state of the from/to squares and current piece back to nothing.
       this.resetMoveState();
      }
    }
    else
    {

      //perform the move
      this.chessGame.completeMove(fromSquare, toSquare, piece);
        
      //Resets the state of the from/to squares and current piece back to nothing.
      this.resetMoveState();
    }
  }

  handleDragImage(mouse: MouseEvent)
  {
    //Adds sets the current mouse position in the UI so it can be tracked.
    this.mouseX = mouse.clientX;
    this.mouseY = mouse.clientY;

    //Adds events to continuously track the movement of the piece.
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp)
  }

  //When the mouse moves, tell the UI where it is.
  onMouseMove = (event: MouseEvent) => 
  {
    this.mouseX = event.clientX; 
    this.mouseY = event.clientY;
  }

  //When the mouse is released, remove the event listeners and reset the from/to/stored legal moves.
  onMouseUp = (event: MouseEvent) => 
  {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    this.currentlyHeldPiece = "";
    this.mouseX = 0;
    this.mouseY = 0;

    this.resetMoveState();
  }
  //#endregion

  resetMoveState()
  {
    this.fromSquare = "";
    this.toSquare = "";
    this.currentLegalMoves = [];
  }

  handleFlipClicked()
  {
    this.isFlipped = !this.isFlipped;
  }
}
