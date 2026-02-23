import { Component, Input, NgZone } from '@angular/core';
import Chonse2 from '../../../lib/chonse2';
import { PieceType } from '../../../lib/piece-type';
import { ToastrService } from 'ngx-toastr';
import InputPositionState from '../input-position-state';
import { InputPositionService } from '../input-position-service';
import { Arrow, ArrowContext } from '../../chessboard/chessboard/arrow';
import { MoveClassification } from '../../chessboard/engine/types/enums';
import { PieceColor } from '../../../lib/piece-color';
import { GameOverReason } from '../../../lib/game-state';
import { Square } from '../../chessboard/square/square';
import { PieceSelector } from "../piece-selector/piece-selector";

@Component({
  selector: 'app-input-position-board',
  imports: [Square, PieceSelector],
  templateUrl: './input-position-board.html',
  styleUrl: './input-position-board.css',
})

export class InputPositionBoard {
  pieceType = PieceType;
  PieceColor = PieceColor;
  GameOverReason = GameOverReason;
  Object = Object;
  MoveClassification = MoveClassification;
  Math = Math;

  COORDS: Array<Array<string>> = Chonse2.COORDS;

  //Game service ID
  @Input({required: true}) stateId: string = "";
  
  //State
  model: InputPositionState;

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
  //FUNCTIONAL
  
  constructor(private ngZone: NgZone, private toastr: ToastrService, private ips: InputPositionService)
  {
    //Board state stored in service to persist across routerlink changes.
    const boardState: InputPositionState = this.ips.getGame(this.stateId);

    this.model = boardState;
  }

  ngOnInit(): void {

    const modelState: InputPositionState | undefined = this.ips.getGame(this.stateId);
    if (!modelState) {
        //Not loading component if there is no game.
        console.warn(`Game ${this.stateId} not found yet`);
        return;
    }
    this.model = modelState;
  }

  async completeMove(fromSquare: string, toSquare: string)
  {    
    const piece = this.currentlyHeldPiece;

    if (!this.toSquare)
    {
      this.resetMoveState();
      return;
    }

    if (this.fromSquare)
    {
      const fromIdx = Chonse2.findIndexFromCoordinate(fromSquare);
      this.model.game.pieceState[fromIdx.rowIndex][fromIdx.colIndex] = "";
    }
    
    const toIdx = Chonse2.findIndexFromCoordinate(toSquare);    
    this.model.game.pieceState[toIdx.rowIndex][toIdx.colIndex] = piece;

    this.currentlyHeldPiece = "";
    this.resetMoveState();
  }


  resetMoveState()
  {
    this.fromSquare = "";
    this.toSquare = "";
    this.currentLegalMoves = [];
  }

  //Import/Reset
  //#region 

  handleResetClicked()
  {
    const bs: InputPositionState = new InputPositionState();
    this.ips.deleteGame(this.stateId);
    this.ips.addGame(this.stateId, bs);
    this.model = this.ips.getGame(this.stateId);
  }
  //#endregion

  //Controls
  //#region 
  handleFlipClicked()
  {
    this.model.isFlipped = !this.model.isFlipped;
  }

  //#endregion

  //Left click/pointer
  //#region 
  onSquareLeftClick = () =>
  {
    this.resetClickedSquares();
    this.model.arrows.length = 0;
  }

  onSquareMouseDown(event: { coordinate: string, piece: string, mouse: PointerEvent })
  {
    //If the square was left clicked
    if (event.mouse.button == 0)
    {
      //update the square that the piece is dragged from
      this.fromSquare = event.coordinate;
      this.currentlyHeldPiece = event.piece;

      if (event.piece != "")
      {
        this.handleDragImage(event.mouse);
      }    
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
        this.model.squareHighlightStatuses[idx.rowIndex][idx.colIndex] = !this.model.squareHighlightStatuses[idx.rowIndex][idx.colIndex];
      }
      else //If the squares are different, they are drawing an arrow.
      {
        const arrow = this.createArrow(this.fromRightClickSquare, this.toRightClickSquare);
        
        if (arrow)
        {
          this.model.arrows.push(arrow); 
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

  onPieceSelectorMouseDown(e: {piece: string, event: PointerEvent})
  {
    //If the square was left clicked
    if (e.event.button == 0)
    {
      //update the square that the piece is dragged from
      this.currentlyHeldPiece = e.piece;

      if (e.piece != "")
      {
        this.handleDragImage(e.event);
      }    
    }
  }

  onPieceSelectorDeleteMouseUp()
  {
    if (this.fromSquare)
    {
      const idx = Chonse2.findIndexFromCoordinate(this.fromSquare);

      this.model.game.pieceState[idx.rowIndex][idx.colIndex] = "";
      this.resetMoveState();
    }
  }
  //#endregion

  //Square highlight logic
  //#region 

  //For the coordinate, get whether it is right clicked or not.
  getRightClickedStatusForSquare(coordinate: string)
  {
    const idx = Chonse2.findIndexFromCoordinate(coordinate);
    
    return this.model.squareHighlightStatuses[idx.rowIndex][idx.colIndex];
  }

  //Sets all the right clicked statuses to false, clearing any right clicked squares.
  resetClickedSquares()
  {
    if (this.model.squareHighlightStatuses.length == 0)
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank: Array<boolean> = [];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank.push(false);
        }
        this.model.squareHighlightStatuses.push(rank);
      }
    }
    else 
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank = this.model.squareHighlightStatuses[i];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank[j] = false;
        }
        this.model.squareHighlightStatuses.push(rank);
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
}
