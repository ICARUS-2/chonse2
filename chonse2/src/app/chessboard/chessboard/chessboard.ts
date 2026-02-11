import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { PieceType } from '../../../lib/piece-type';
import { Square } from '../square/square';
import { PieceColor } from '../../../lib/piece-color';
import { CapturedPieces } from "../captured-pieces/captured-pieces";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PromotionModal } from '../promotion-modal/promotion-modal';
import Chonse2 from '../../../lib/chonse2';
import { GameOverReason } from '../../../lib/game-state';
import { CommonModule } from '@angular/common';
import LocalStorageHelper from './local-storage-helper';
import { FormsModule } from '@angular/forms';
import { ChessBoardService as ChessBoardService } from './chess-board-service';
import {Arrow, ArrowContext } from './arrow';
import BoardState from './board-state';
import Sound from './sound';
import { ImportModal } from '../import-modal.ts/import-modal';

@Component({
  selector: 'app-chessboard',
  imports: [Square, CapturedPieces, CommonModule, FormsModule],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
})
export class Chessboard implements OnInit, AfterViewInit {
  pieceType = PieceType;
  pieceColor = PieceColor;
  gameOverReason = GameOverReason;
  localStorageHelper = LocalStorageHelper;

  COORDS: Array<Array<string>> = Chonse2.COORDS;

  //Game service ID
  @Input({required: true}) gameId: string = "";
  
  //State
  boardState: BoardState

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
  arrows: Array<Arrow> = [];
  @ViewChild('board', { static: false }) boardElement!: ElementRef<HTMLDivElement>;
  @HostListener('window:resize') onResize() { this.updateBoardSize();}
  boardPixelSize: number = 0;
  animatedPiece: string = "";
  animatedPieceX: number = 0;
  animatedPieceY: number = 0;
  animationDuration: number = 100; //ms
  animatedPieceCoord: string = "";
  
  //FUNCTIONAL
  clickToMove: boolean = false;

  constructor(private modalService: NgbModal, private chessBoardService: ChessBoardService)
  {
    //Board state stored in service to persist across routerlink changes.
    const boardState: BoardState = this.chessBoardService.getGame(this.gameId);

    this.boardState = boardState;
  }

  ngOnInit(): void {

    const boardState: BoardState | undefined = this.chessBoardService.getGame(this.gameId);
    if (!boardState) {
        //Not loading component if there is no game.
        console.warn(`Game ${this.gameId} not found yet`);
        return;
    }
    this.boardState = boardState;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateBoardSize());
  }

  completeMove(fromSquare: string, toSquare: string)
  {
    const piece = this.currentlyHeldPiece;
    if (!this.currentLegalMoves.includes(toSquare))
    {
      return;
    }
    
    const stateCopy = this.boardState.getCurrentState().getFullDeepCopy();

    const isPromotion = (
      this.currentlyHeldPiece == PieceType.WHITE_PAWN && this.toSquare.includes(Chonse2.WHITE_PAWN_PROMOTE_RANK.toString()) ||
      this.currentlyHeldPiece == PieceType.BLACK_PAWN && this.toSquare.includes(Chonse2.BLACK_PAWN_PROMOTE_RANK.toString()))

    let moveResult: IMoveResult = {result: false, notation: "", fromCoord: fromSquare, toCoord: toSquare, piece: PieceType.NONE};

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
        moveResult = stateCopy.completeMove(fromSquare, toSquare, result);
        this.boardState.pushState(stateCopy, moveResult);
      } )
      .catch( () =>
      {
        //if the dialog was forced closed, promote to queen by default.
        moveResult = stateCopy.completeMove(fromSquare, toSquare, PieceType.QUEEN);
        this.boardState.pushState(stateCopy, moveResult);
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
      moveResult = stateCopy.completeMove(fromSquare, toSquare, piece);
      this.boardState.pushState(stateCopy, moveResult);
        
      //Resets the state of the from/to squares and current piece back to nothing.
      this.resetMoveState();
    }

    Sound.playSoundForMove(moveResult.notation);
  }


  resetMoveState()
  {
    this.fromSquare = "";
    this.toSquare = "";
    this.currentLegalMoves = [];
  }

  //Import/Reset
  //#region 
  handleImportClicked()
  {
    const ref = this.modalService.open(ImportModal, {size: 'lg'});

    ref.result.then( result => 
      {
        try 
        {
          const newBoard: BoardState = BoardState.parsePGN(result);
          console.log(newBoard);
          this.chessBoardService.deleteGame(this.gameId);
          this.chessBoardService.addGame(this.gameId, newBoard);
          this.boardState = this.chessBoardService.getGame(this.gameId);
        }
        catch(ex)
        {
          alert("PGN Error")
        }
      }
    )
    .catch(err => 
      {

      }
    )
  }

  handleResetClicked()
  {
    const bs: BoardState = new BoardState();
    this.chessBoardService.deleteGame(this.gameId);
    this.chessBoardService.addGame(this.gameId, bs);
    this.boardState = this.chessBoardService.getGame(this.gameId);
  }
  //#endregion

  //Controls
  //#region 
  handleFlipClicked()
  {
    this.boardState.isFlipped = !this.boardState.isFlipped;
  }

  handleDoubleBackButtonClicked()
  {
    Sound.playSound(Sound.MOVE);
    this.boardState.goBackToStart();
  }

  handleBackButtonClicked()
  {
    const mostRecentMove = this.boardState.getMostRecentMove();


    this.animateMove(mostRecentMove.toCoord, mostRecentMove.fromCoord, mostRecentMove.piece);

    setTimeout( () =>
    {
      this.boardState.goBack();
      Sound.playSound(Sound.MOVE);
    }, this.animationDuration )
  }

  handleForwardButtonClicked()
  {
    const mostRecentMove = this.boardState.getFutureMove();
    console.log(mostRecentMove);
    this.animateMove(mostRecentMove.fromCoord, mostRecentMove.toCoord, mostRecentMove.piece);
    setTimeout( () =>
    {
      this.boardState.goForward();
      Sound.playSoundForMove(mostRecentMove.notation);
    }, this.animationDuration )
  }   

  handleDoubleForwardButtonClicked()
  {
    this.boardState.goForwardToEnd();
    Sound.playSound(Sound.CAPTURE);
  }

  //Should the back buttons be enabled
  areBackButtonsEnabled(): boolean 
  {
    return this.boardState.mainStackPointer != 0 || this.boardState.divergenceStackPointer != -1;
  }

  areForwardButtonsEnabled(): boolean 
  {
    //If we are deviating from the main game (by going back) then you can't logically go forward.
    if (this.boardState.divergenceStack.length != 0)
    {
      return false;
    }

    //If there are no more moves left after this, then you can't go back.
    if (this.boardState.mainStackPointer == this.boardState.mainStateStack.length - 1)
    {
      return false;
    }

    return true;
  }

  moveClicked(index: number)
  {
    if (this.boardState.divergenceStack.length != 0)
    { 
      this.boardState.goBackToStart();
    }

    this.boardState.mainStackPointer = index;
  }

  //#endregion

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
      //Mouse down doesn't matter if the user is clicking to move.
      if (LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE))
      {
        return;
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
      this.currentLegalMoves = this.boardState.getCurrentState().getLegalMoves(event.coordinate);
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
      //If this is click to move mode
      if (LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE))
      {
        //If the fromsquare has not been selected, we should set it and compute its legal moves.
        if (this.fromSquare == "")
        {
          this.fromSquare = event.coordinate;
          this.currentLegalMoves = this.boardState.getCurrentState().getLegalMoves(this.fromSquare);

          //If it has no legal moves, reset the state to reduce the number of clicks required when switching to another piece.
          if (this.currentLegalMoves.length == 0)
          {
            this.resetMoveState();
          }

          //Return so that the toSquare logic cannot be triggered.
          return;
        }

        //If the toSquare is empty and we got this far, the user would like to move to this square.
        if (this.toSquare == "")
        {
          this.toSquare = event.coordinate;

          //If it is not legal, reset the state and disregard the from square, or complete the move if it is legal.
          if (!this.currentLegalMoves.includes(this.toSquare))
          {
            this.resetMoveState();
          }
          else
          {
            this.completeMove(this.fromSquare, this.toSquare);
          }
        }
        return;
      }

      //If it is not click to move mode:
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
        this.boardState.squareHighlightStatuses[idx.rowIndex][idx.colIndex] = !this.boardState.squareHighlightStatuses[idx.rowIndex][idx.colIndex];
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
    
    return this.boardState.squareHighlightStatuses[idx.rowIndex][idx.colIndex];
  }

  //Sets all the right clicked statuses to false, clearing any right clicked squares.
  resetClickedSquares()
  {
    if (this.boardState.squareHighlightStatuses.length == 0)
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank: Array<boolean> = [];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank.push(false);
        }
        this.boardState.squareHighlightStatuses.push(rank);
      }
    }
    else 
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank = this.boardState.squareHighlightStatuses[i];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank[j] = false;
        }
        this.boardState.squareHighlightStatuses.push(rank);
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

  createArrow(fromCoordinate: string, toCoordinate: string, color: string = "rgba(0,0,255,0.6", context: ArrowContext = ArrowContext.Player) : Arrow | null
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
      color: color,
      context: context}
  }
  //#endregion

  //Endgame square animation logic
  //#region
  _isSquareEndgameKingSquare(rankIndex: number, fileIndex: number)
  {
    return this._isSquareCheckmatedKing(rankIndex, fileIndex) || this._isSquareWinningKing(rankIndex, fileIndex) || this._isSquareKingInDraw(rankIndex, fileIndex);
  }

  _isSquareCheckmatedKing(rankIndex: number, fileIndex: number) : boolean
  {
    return (this.boardState.getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING && this.boardState.getCurrentState().gameState.winner == PieceColor.BLACK) || (this.boardState.getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING && this.boardState.getCurrentState().gameState.winner == PieceColor.WHITE) && this.boardState.getCurrentState().gameState.reason == GameOverReason.Checkmate;
  }

  _isSquareWinningKing(rankIndex: number, fileIndex: number) : boolean
  {
    return (this.boardState.getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING && this.boardState.getCurrentState().gameState.winner == PieceColor.WHITE) || (this.boardState.getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING && this.boardState.getCurrentState().gameState.winner == PieceColor.BLACK); 
  }

  _isSquareKingInDraw(rankIndex: number, fileIndex: number) : boolean 
  { 
    return this.boardState.getCurrentState().gameState.isDraw() && (this.boardState.getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING || this.boardState.getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING);
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
  
  //Animation for piece movement logic
  //#region

  updateBoardSize()
  {
    if (!this.boardElement)
    {
      return;
    }

    this.boardPixelSize = this.boardElement.nativeElement.getBoundingClientRect().width;
  }
  
  getBoardTopLeft(): { left: number; top: number } {
    const rect = this.boardElement.nativeElement.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }

  getBoardPixelSize(): number 
  {
    return this.boardPixelSize;
  }

  getSquarePixelSize(): number 
  {
    return this.boardPixelSize / Chonse2.SIZE;
  }

  getPiecePixelPosition(coordinate: string): { x: number, y: number } 
  {
    const { rowIndex, colIndex } = Chonse2.findIndexFromCoordinate(coordinate);
    const squareSize = this.getSquarePixelSize();

    //If board is flipped
    if (this.boardState.isFlipped) 
    {
      return {
          x: (7 - colIndex) * squareSize,
          y: (7 - rowIndex) * squareSize
      };
    }

    return {
        x: colIndex * squareSize,
        y: rowIndex * squareSize
    };
  }

  animateMove(from: string, to: string, piece: string) 
  {
    this.animatedPieceCoord = from;
    const boardOffset = this.getBoardTopLeft();
    const fromCoords = this.getPiecePixelPosition(from);
    const toCoords = this.getPiecePixelPosition(to);

    this.animatedPiece = piece;
    this.animatedPieceX = fromCoords.x + boardOffset.left;
    this.animatedPieceY = fromCoords.y + boardOffset.top;
    //Wait a tick so the browser registers the initial position
    setTimeout(() => {
        this.animatedPieceX = toCoords.x + boardOffset.left;
        this.animatedPieceY = toCoords.y + boardOffset.top;
    }, 0);

    //Remove the animated piece after animation completes
    setTimeout(() => {
        this.animatedPiece = "";
        this.animatedPieceCoord = "";
    }, this.animationDuration);
}

  //#endregion
  
}
