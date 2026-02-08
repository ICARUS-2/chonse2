import { Component, Input, OnInit } from '@angular/core';
import { PieceType } from '../../../lib/piece-type';
import { Square } from '../square/square';
import { PieceColor } from '../../../lib/piece-color';
import { CapturedPieces } from "../captured-pieces/captured-pieces";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PromotionModal } from '../../promotion-modal/promotion-modal';
import Chonse2 from '../../../lib/chonse2';
import { GameOverReason, GameState } from '../../../lib/game-state';
import { CommonModule } from '@angular/common';
import LocalStorageHelper from './local-storage-helper';
import { FormsModule } from '@angular/forms';
import { ChessBoardService as ChessBoardService } from './chess-board-service';
import Arrow from './arrow';
import BoardState from './board-state';

@Component({
  selector: 'app-chessboard',
  imports: [Square, CapturedPieces, CommonModule, FormsModule],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
})
export class Chessboard implements OnInit {
  pieceType = PieceType;
  pieceColor = PieceColor;
  gameOverReason = GameOverReason;
  localStorageHelper = LocalStorageHelper;

  COORDS: Array<Array<string>> = Chonse2.COORDS;

  //Game service ID
  @Input({required: true}) gameId: string = "";

  //PIECES ON THE BOARD CURRENTLY
  @Input() chessGame!: Chonse2;
  
  //MOVE PROPERTIES
  currentLegalMoves: string[] = [];
  currentlyHeldPiece: string = "";
  fromSquare: string = "";
  toSquare: string = "";
  fromRightClickSquare: string = "";
  toRightClickSquare: string = "";

  //COSMETIC
  private readonly _ARROW_PULLBACK = 0.18;
  mouseX: number = 0;
  mouseY: number = 0;
  isFlipped: boolean = false;
  squareRightClickStatuses: Array<Array<boolean>> = [];
  arrows: Array<Arrow> = [];
  
  //FUNCTIONAL
  clickToMove: boolean = false;

  constructor(private modalService: NgbModal, private chessBoardService: ChessBoardService)
  {

  }

  ngOnInit(): void {
    //Board state stored in service to persist across routerlink changes.
    const boardState: BoardState = this.chessBoardService.getGame(this.gameId);

    //Sets the state from the service.
    this.chessGame = boardState.chessGame;
    this.arrows = boardState.arrows;
    this.squareRightClickStatuses = boardState.squareHighlightStatuses;
  }

  //Left click/pointer
  //#region 
  onSquareLeftClick = () =>
  {
    this.resetClickedSquares();
    this.arrows.length = 0;
  }

  onSquareMouseDown(event: { coordinate: string, piece: string, mouse: PointerEvent })
  {
    //If the square was left clicked
    if (event.mouse.button == 0)
    {
      //If the user wishes to click to move, this event should be used for both picking up and placing.
      if (LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE))
      {
        if (this.fromSquare == "")
        {
          this.fromSquare = event.coordinate;
        }
        else
        {
          this.toSquare = event.coordinate;

          this.completeMove(this.fromSquare, this.toSquare);
        }
      }
      else //if not, the piece is dragged under the mouse cursor.
      {
        //update the square that the piece is dragged from
        this.fromSquare = event.coordinate;
        this.currentlyHeldPiece = event.piece;

        if (event.piece != "")
        {
          this.handleDragImage(event.mouse);
        }    
      }

      //property will display legal moves on the screen.
      this.currentLegalMoves = this.chessGame.getLegalMoves(event.coordinate);
    }

    //Right click for square highlight or arrow drawing
    if (event.mouse.button == 2)
    {
      this.fromRightClickSquare = event.coordinate;
    }
  }

  onSquareMouseUp(event: { coordinate: string, mouse: PointerEvent })
  {
    if (event.mouse.button == 0)
    {
      if (LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE))
      {
        return;
      }

      //sets the square in the UI to where the player is dropping the piece.
      this.toSquare = event.coordinate;

      const fromSquare = this.fromSquare;
      const toSquare = event.coordinate;

      this.completeMove(fromSquare, toSquare);
    }

    if (event.mouse.button == 2)
    {
      this.toRightClickSquare = event.coordinate;

      //If the squares are the same, the user is highlighting a sqaure.
      if (this.fromRightClickSquare == this.toRightClickSquare)
      {
        //Gets the index of the square to highlight.
        const idx = Chonse2.findIndexFromCoordinate(this.toRightClickSquare);

        //Sets the status telling it to change color.
        this.squareRightClickStatuses[idx.rowIndex][idx.colIndex] = !this.squareRightClickStatuses[idx.rowIndex][idx.colIndex];
      }
      else //If the squares are different, they are drawing an arrow.
      {
        const arrow = this.createArrow(this.fromRightClickSquare, this.toRightClickSquare);
        
        if (arrow)
        {
          this.arrows.push(arrow); 
        }
      }

      this.fromRightClickSquare = "";
      this.toRightClickSquare = "";
    }
  }

  completeMove(fromSquare: string, toSquare: string)
  {
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

  handleDragImage(mouse: PointerEvent)
  {
    //Adds sets the current mouse position in the UI so it can be tracked.
    this.mouseX = mouse.clientX;
    this.mouseY = mouse.clientY;

    //Adds events to continuously track the movement of the piece.
    document.addEventListener('pointermove', this.onMouseMove);
    document.addEventListener('pointerup', this.onMouseUp)
  }

  //When the mouse moves, tell the UI where it is.
  onMouseMove = (event: PointerEvent) => 
  {
    this.mouseX = event.clientX; 
    this.mouseY = event.clientY;
  }

  //When the mouse is released, remove the event listeners and reset the from/to/stored legal moves.
  onMouseUp = (event: PointerEvent) => 
  {
    document.removeEventListener('pointermove', this.onMouseMove);
    document.removeEventListener('pointerup', this.onMouseUp);

    this.currentlyHeldPiece = "";
    this.mouseX = 0;
    this.mouseY = 0;

    this.resetMoveState();
  }
  //#endregion

  //Square highlight logic
  //#region 

  //For the coordinate, get whether it is right clicked or not.
  getRightClickedStatusForSquare(coordinate: string)
  {
    const idx = Chonse2.findIndexFromCoordinate(coordinate);
    
    return this.squareRightClickStatuses[idx.rowIndex][idx.colIndex];
  }

  //Sets all the right clicked statuses to false, clearing any right clicked squares.
  resetClickedSquares()
  {
    if (this.squareRightClickStatuses.length == 0)
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank: Array<boolean> = [];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank.push(false);
        }
        this.squareRightClickStatuses.push(rank);
      }
    }
    else 
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank = this.squareRightClickStatuses[i];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank[j] = false;
        }
        this.squareRightClickStatuses.push(rank);
      }
    }
  }
  //#endregion

  //Arrow logic
  //#region
  //had some help with cat i farted for this one, i aint a graphic designer lol
  _getArrowCoords(arrow: Arrow) 
  {
    const x1 = arrow.fromFile + 0.5;
    const y1 = arrow.fromRank + 0.5;
    const x2 = arrow.toFile + 0.5;
    const y2 = arrow.toRank + 0.5;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;

    return {
      x1,
      y1,
      x2: x2 - (dx / len) * this._ARROW_PULLBACK,
      y2: y2 - (dy / len) * this._ARROW_PULLBACK
    };
  }

  createArrow(fromCoordinate: string, toCoordinate: string, color: string = "rgba(0,0,255,0.6") : Arrow | null
  {
    //Cannot create an arrow from or to a nonextistant place.
    if (!fromCoordinate || !toCoordinate)
    {
      return null;
    }

    //Cannot create an arrow from -> to the same square
    if (fromCoordinate == toCoordinate)
    {
      return null;
    }

    //Get the indeces and create the arrow from that.
    const fromIdx = Chonse2.findIndexFromCoordinate(fromCoordinate);
    const toIdx = Chonse2.findIndexFromCoordinate(toCoordinate);

    return { 
      fromRank: fromIdx.rowIndex, 
      fromFile: fromIdx.colIndex, 
      toRank: toIdx.rowIndex, 
      toFile: toIdx.colIndex, 
      color: color}
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
  
  //Endgame square animation logic
  //#region
  _isSquareEndgameKingSquare(rankIndex: number, fileIndex: number)
  {
    return this._isSquareCheckmatedKing(rankIndex, fileIndex) || this._isSquareWinningKing(rankIndex, fileIndex) || this._isSquareKingInDraw(rankIndex, fileIndex);
  }

  _isSquareCheckmatedKing(rankIndex: number, fileIndex: number) : boolean
  {
    return (this.chessGame.pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING && this.chessGame.gameState.winner == PieceColor.BLACK) || (this.chessGame.pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING && this.chessGame.gameState.winner == PieceColor.WHITE) && this.chessGame.gameState.reason == GameOverReason.Checkmate;
  }

  _isSquareWinningKing(rankIndex: number, fileIndex: number) : boolean
  {
    return (this.chessGame.pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING && this.chessGame.gameState.winner == PieceColor.WHITE) || (this.chessGame.pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING && this.chessGame.gameState.winner == PieceColor.BLACK); 
  }

  _isSquareKingInDraw(rankIndex: number, fileIndex: number) : boolean 
  { 
    return this.chessGame.gameState.isDraw() && (this.chessGame.pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING || this.chessGame.pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING);
  }

  _getEndgameSquareBackgroundColor(rankIndex: number, fileIndex: number): string
  {
    if (this._isSquareCheckmatedKing(rankIndex, fileIndex))
    {
      return "red";
    }

    if (this._isSquareKingInDraw(rankIndex, fileIndex))
    {
      return "skyblue"
    }

    if (this._isSquareWinningKing(rankIndex, fileIndex))
    {
      return "limegreen";
    }

    return "transparent";
  }

  _getEndgameSquareImgSrc(rankIndex: number, fileIndex: number): string
  {
    const base = "icons/";

    if (this._isSquareCheckmatedKing(rankIndex, fileIndex))
    {
      return base + "checkmate.webp";
    }

    if (this._isSquareKingInDraw(rankIndex, fileIndex))
    {
      return base + "draw.webp"
    }

    if (this._isSquareWinningKing(rankIndex, fileIndex))
    {
      return base + "winner.webp";
    }

    return "";
  }

  _getEndgameSquareText(rankIndex: number, fileIndex: number) : string
  {
    if (this._isSquareCheckmatedKing(rankIndex, fileIndex))
    {
      return "Checkmate";
    }

    if (this._isSquareWinningKing(rankIndex, fileIndex))
    {
      return "Winner";
    }

    if (this._isSquareKingInDraw(rankIndex, fileIndex))
    {
      return "Draw";
    }

    return "";
  }
  //#endregion

}
