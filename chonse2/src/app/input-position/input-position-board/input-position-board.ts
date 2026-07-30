import { ChangeDetectionStrategy, Component, inject, input, Input, NgZone, signal, WritableSignal } from '@angular/core';
import { Square } from '../../chessboard/square/square';
import { PieceSelector } from "../piece-selector/piece-selector";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import ThemeService from '../../themes/theme-service';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import { Arrow, ArrowContext } from '../../chessboard/chessboard/arrow';
import { InputPositionService } from '../input-position-service';
import InputPositionState from '../input-position-state';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { FenImportModal } from '../fen-import-modal/fen-import-modal';
import { ToastrService } from 'ngx-toastr';
import { IconButton } from "../../ui/icon-button/icon-button";
import GameLinkHelper from '../../chessboard/chessboard/game-link-helper';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import Chonse2 from '../../../libs/chess-game-lib/implementations/chonse2-impl/chonse2';
import { CastlingRightsType } from '../../../libs/chess-game-lib/types/castling-rights-type';
import { ChessConstants } from '../../../libs/chess-game-lib/types/constants';
import { GameOverReason } from '../../../libs/chess-game-lib/types/game-state';
import { PieceColor } from '../../../libs/chess-game-lib/types/piece-color';
import { PieceType } from '../../../libs/chess-game-lib/types/piece-type';
import ChessboardHelper from '../../chessboard/helpers';

@Component({
  selector: 'app-input-position-board',
  imports: [Square, PieceSelector, FormsModule, CommonModule, BootstrapButton, IconButton, TranslatePipe],
  templateUrl: './input-position-board.html',
  styleUrl: './input-position-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InputPositionBoard {
  pieceType = PieceType;
  PieceColor = PieceColor;
  GameOverReason = GameOverReason;
  ChessboardHelper = ChessboardHelper;
  Object = Object;
  MoveClassification = MoveClassification;
  Math = Math;
  CastlingRightsType = CastlingRightsType;

  COORDS: Array<Array<string>> = ChessConstants.COORDS;

  //Game service ID
  stateId = input<string>('');

  //State
  model: WritableSignal<InputPositionState>;

  //Move properties
  currentlyHeldPiece = signal<string>('');
  fromSquare = signal<string>('');
  toSquare = signal<string>('');
  fromRightClickSquare = signal<string>('');
  toRightClickSquare = signal<string>('');

  //COSMETIC
  private readonly _ARROW_PULLBACK = 0.18;
  mouseX = signal<number>(0);
  mouseY = signal<number>(0);
  
  private static readonly X_VECTOR = [-1, 1, 0, 0, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, -1, 1, 1];
  private static readonly Y_VECTOR = [0, 0, -1, 1, /* <- ROOK MOVEMENTS | BISHOP MOVEMENTS -> */  -1, 1, -1, 1];

  private translate = inject(TranslateService);

  constructor(
    private router: Router, 
    private ips: InputPositionService, 
    public themeService: ThemeService,
    private ngbModalService: NgbModal,
    private toastrService: ToastrService)
  {
    //Board state stored in service to persist across routerlink changes.
    const boardState: InputPositionState = this.ips.getGame(this.stateId());

    this.model = signal<InputPositionState>(boardState);
  }

  ngOnInit(): void {

    const modelState: InputPositionState | undefined = this.ips.getGame(this.stateId());
    if (!modelState) {
        //Not loading component if there is no game.
        console.warn(`Game ${this.stateId} not found yet`);
        return;
    }
    this.model.set(modelState);
  }

  async completeMove(fromSquare: string, toSquare: string)
  {    
    const piece = this.currentlyHeldPiece();

    if (!this.toSquare())
    {
      this.resetMoveState();
      return;
    }

    if (this.fromSquare())
    {
      this.setPieceOnBoard(fromSquare, "");
    }
  
    this.setPieceOnBoard(toSquare, piece);

    this.currentlyHeldPiece.set("");
    this.resetMoveState();
  }


  resetMoveState()
  {
    this.fromSquare.set("");
    this.toSquare.set("");
  }

  //#region Controls
  handleFlipClicked()
  {
    this.model().isFlipped.update( f => !f);
  }

  handleResetClicked()
  {
    this.model().game().reset();
    this._afterStateChanged();
  }

  handleClearClicked()
  {
    this.model().game().clear();
    this._afterStateChanged();
  }

  submitButtonClicked()
  {
    if (!this.doesValidationPass())
    {
      return;
    }

    const fen = this.model().game().getFEN();

    this.router.navigate(['/analysis'], {state: { "inputtedPosition" : fen }})
  }

  playVsAiButtonClicked()
  {
    if (!this.doesValidationPass())
    {
      return;
    }

    const fen = this.model().game().getFEN();

    this.router.navigate(['/vs-ai'], {state: { "inputtedPosition" : fen }})
  }

  flipButtonClicked()
  {
    this.model().isFlipped.update( v => !v );
  }
  //#endregion

  //#region Import/Export
  handleImportClicked()
  {
    //open the import modal.
    const modalRef = this.ngbModalService.open(FenImportModal, {size: "lg"});

    modalRef.result.then( result =>
      {
        if (result == null)
        {
          this.toastrService.error(this.translate.instant("inputPosition.board.toastr.importCancelled"));
          return;
        }

        const newState = new InputPositionState();
        newState.game.set(result);

        this.ips.deleteGame(this.stateId());
        this.ips.addGame(this.stateId() ,newState);
        this.model.set(newState);

        this.toastrService.success(this.translate.instant("inputPosition.board.toastr.importSuccess"));
      }
    )
    .catch(() => { /*modal was dismissed, no error*/ })
  }
  
  copyFenClicked()
  {
    try 
    {
      navigator.clipboard.writeText(this.model().game().getFEN());
      this.toastrService.info(this.translate.instant("inputPosition.board.toastr.copyFenSuccess"));
    }
    catch(ex)
    {
      this.toastrService.error(this.translate.instant("inputPosition.board.toastr.copyFenError"));
    }
  }

  copyFenLinkClicked()
  {
    try 
    {
      navigator.clipboard.writeText(GameLinkHelper.generateFenLink(this.model().game().getFEN()));
      this.toastrService.info(this.translate.instant("inputPosition.board.toastr.copyLinkSuccess"));
    }
    catch(ex)
    {
      this.toastrService.error(this.translate.instant("inputPosition.board.toastr.copyLinkError"));
    }
  }
  //#endregion

  //#region Left click/pointer
  onSquareLeftClick = () =>
  {
    this.resetClickedSquares();
    this.model().arrows.set([]);
  }

  onSquareMouseDown(event: { coordinate: string, piece: string, mouse: PointerEvent })
  {
    //If the square was left clicked
    if (event.mouse.button == 0)
    {
      //update the square that the piece is dragged from
      this.fromSquare.set(event.coordinate);
      this.currentlyHeldPiece.set(event.piece);

      if (event.piece != "")
      {
        this.handleDragImage(event.mouse);
      }    
    }

    //Right click for square highlight or arrow drawing
    if (event.mouse.button == 2)
    {
      this.fromRightClickSquare.set(event.coordinate);
    }
  }

  onSquareMouseUp(event: { coordinate: string, mouse: PointerEvent })
  {
    if (event.mouse.button == 0)
    {
      if (!this.currentlyHeldPiece)
      {
        return;
      }

      //sets the square in the UI to where the player is dropping the piece.
      this.toSquare.set(event.coordinate);

      const fromSquare = this.fromSquare;
      const toSquare = event.coordinate;

      this.completeMove(fromSquare(), toSquare);
    }

    if (event.mouse.button == 2)
    {
      this.toRightClickSquare.set(event.coordinate);

      //If the squares are the same, the user is highlighting a sqaure.
      if (this.fromRightClickSquare == this.toRightClickSquare)
      {
        //Gets the index of the square to highlight.
        const idx = Chonse2.findIndexFromCoordinate(this.toRightClickSquare());

        //Sets the status telling it to change color.
        this.model().squareHighlightStatuses()[idx.rowIndex][idx.colIndex] = !this.model().squareHighlightStatuses()[idx.rowIndex][idx.colIndex];
      }
      else //If the squares are different, they are drawing an arrow.
      {
        const arrow = this.createArrow(this.fromRightClickSquare(), this.toRightClickSquare());
        
        if (arrow)
        {
          this.model().arrows().push(arrow); 
        }
      }

      this.fromRightClickSquare.set("");
      this.toRightClickSquare.set("");
    }
  }

  handleDragImage(mouse: PointerEvent)
  {
    //Adds sets the current mouse position in the UI so it can be tracked.
    this.mouseX.set(mouse.clientX);
    this.mouseY.set(mouse.clientY);

    //Adds events to continuously track the movement of the piece.
    document.addEventListener('pointermove', this.onMouseMove);
    document.addEventListener('pointerup', this.onMouseUp)
  }

  //When the mouse moves, tell the UI where it is.
  onMouseMove = (event: PointerEvent) => 
  {
    this.mouseX.set(event.clientX); 
    this.mouseY.set(event.clientY);
  }

  //When the mouse is released, remove the event listeners and reset the from/to/stored legal moves.
  onMouseUp = (event: PointerEvent) => 
  {
    document.removeEventListener('pointermove', this.onMouseMove);
    document.removeEventListener('pointerup', this.onMouseUp);

    this.currentlyHeldPiece.set("");
    this.mouseX.set(0);
    this.mouseY.set(0);

    this.resetMoveState();
  }

  onPieceSelectorMouseDown(e: {piece: string, event: PointerEvent})
  {
    //If the square was left clicked
    if (e.event.button == 0)
    {
      //update the square that the piece is dragged from
      this.currentlyHeldPiece.set(e.piece);

      if (e.piece != "")
      {
        this.handleDragImage(e.event);
      }    
    }
  }

  onPieceSelectorDeleteMouseUp()
  {
    if (this.fromSquare())
    {
      this.setPieceOnBoard(this.fromSquare(), "");
      this.resetMoveState();
    }
  }

  onTurnChanged(event: boolean)
  {
    this.model().game().setTurn(event);
    this.model().game().setEnPassantSquare("");
  }

  //#region Board
  getPotentialEnPassantSquares(): Array<string>
  {
    const arr: string[] = [];

    //The indeces of both the ranks the pawn moves to and the ones where the capture takes place.
    const rankIndex = this.model().game().getTurn() ? 3 : 4;
    const previousRankIndex = this.model().game().getTurn() ? 2 : 5;

    //The ranks where the pawn is located (two spaces) and the en passant rank beneath it.
    const pawnRank = this.model().game().getPieceState()[rankIndex];
    const enPassantSquareRank = this.model().game().getPieceState()[previousRankIndex];

    //Check every possible space for en passant.
    for(let i = 0; i < pawnRank.length; i++)
    {
      //Square the pawn is on and the one beneath it the capturer moves to.
      const pawnRankSquareContent = pawnRank[i];
      const potentialEnPassantSquareContent = enPassantSquareRank[i];

      //If there is a pawn that has moved two spaces AND there is nothing underneath it.
      if (this.model().game().getTurn() ? pawnRankSquareContent == PieceType.BLACK_PAWN : pawnRankSquareContent == PieceType.WHITE_PAWN)
      {
        if (potentialEnPassantSquareContent == "")
        {
          arr.push(ChessConstants.COORDS[previousRankIndex][i]);
        }
      }
    }

    return arr;
  }

  getPotentialForCastlingRights(isWhite: boolean, isKingside: boolean): boolean
  {
    //Where the king is on the board.
    const king = this.model().game().getKingCoordinate( isWhite ? PieceColor.WHITE : PieceColor.BLACK );
    
    //To have castling rights you need to have a king on the board (obviously) and the rook needs to be in its place.
    if (king && ( isWhite ? king == ChessConstants.WHITE_KING_SQUARE : king == ChessConstants.BLACK_KING_SQUARE ))
    {
      const rookCoord = isWhite ? (isKingside ? ChessConstants.WHITE_KINGSIDE_ROOK_SQUARE : ChessConstants.WHITE_QUEENSIDE_ROOK_SQUARE) : (isKingside ? ChessConstants.BLACK_KINGSIDE_ROOK_SQUARE : ChessConstants.BLACK_QUEENSIDE_ROOK_SQUARE);
      const rookSquareIndex = Chonse2.findIndexFromCoordinate(rookCoord);
      const rookSquareContent = this.model().game().getPieceState()[rookSquareIndex.rowIndex][rookSquareIndex.colIndex];
      const rookPiece = isWhite ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

      //If there is no rook in that place, no castling rights can potentially exist there.
      if (rookSquareContent != rookPiece)
      {
        isWhite ? 
          //White
          (isKingside ?
            this.model().game().setCastlingRights(CastlingRightsType.WhiteKingside, false) : 
            this.model().game().setCastlingRights(CastlingRightsType.WhiteQueenside, false)) : 

          //Black
          (isKingside ? 
            this.model().game().setCastlingRights(CastlingRightsType.BlackKingside, false) : 
            this.model().game().setCastlingRights(CastlingRightsType.BlackQueenside, false));
      }
      else 
      {
        //If the king exists and the rook piece is in its spot, then you have castling rights.
        return true; 
      }
    }
    else 
    {
      //If there is no king or the king has moved, strip both.
      if (isWhite)
      {
        this.model().game().setCastlingRights(CastlingRightsType.WhiteKingside, false);
        this.model().game().setCastlingRights(CastlingRightsType.WhiteQueenside, false);
      }
      else 
      {
        this.model().game().setCastlingRights(CastlingRightsType.BlackKingside, false);
        this.model().game().setCastlingRights(CastlingRightsType.BlackQueenside, false);
      }
    }

    //If any check failed, castling rights cannot exist.
    return false;
  }

  setPieceOnBoard(coord: string, piece: string)
  {
    this.model().game().setPieceOnBoard(coord, piece);
    this._afterStateChanged();
  }

  _afterStateChanged()
  {
    const epArr = this.getPotentialEnPassantSquares();

    if (!epArr.includes(this.model().game().getEnPassantSquare()))
    {
      this.model().game().setEnPassantSquare("");
    }
  }

  doesValidationPass(): boolean
  {
    const game = this.model().game;

    //One king per side.
    const flattenedPieceState = game().getPieceState().flat();
    const whiteKings = flattenedPieceState.filter((p: string) => p == PieceType.WHITE_KING);
    const blackKings = flattenedPieceState.filter((p: string) => p == PieceType.BLACK_KING);

    if (whiteKings.length != 1 || blackKings.length != 1)
    {
      return false;
    }

    //Kings are not adjacent.
    const whiteKing = game().getKingCoordinate(PieceColor.WHITE);
    const whiteKingIdx = Chonse2.findIndexFromCoordinate(whiteKing);
    for(let i = 0; i < InputPositionBoard.X_VECTOR.length; i++)
    {
      const xComponent = InputPositionBoard.X_VECTOR[i] + whiteKingIdx.rowIndex;
      const yComponent = InputPositionBoard.Y_VECTOR[i] + whiteKingIdx.colIndex;
      const rank = game().getPieceState()[xComponent]
      
      if (rank)
      {
        const squareContent = rank[yComponent];
        if (squareContent != undefined)
        {
          if (squareContent == PieceType.BLACK_KING)
          {
            return false;
          }
        } 
      }
    }

    //Pawns are not on the first or eighth rank.
    const firstRank = game().getPieceState()[0];
    const lastRank = game().getPieceState()[game().getPieceState().length - 1];

    for(let i: number = 0; i < firstRank.length; i++)
    {
      const firstRankSquare: string = firstRank[i];
      const lastRankSquare: string = lastRank[i];

      if (firstRankSquare == PieceType.WHITE_PAWN ||
         firstRankSquare == PieceType.BLACK_PAWN || 
         lastRankSquare == PieceType.WHITE_PAWN || 
         lastRankSquare == PieceType.BLACK_PAWN)
      {
        return false;
      }
    }

    //Both kings cannot be in check.
    const isWhiteInCheck: boolean = game().isInCheck(PieceColor.WHITE);
    const isBlackInCheck: boolean = game().isInCheck(PieceColor.BLACK);

    if (isWhiteInCheck && isBlackInCheck)
    {
      return false;
    }

    //White to move -> Black cannot be in check. Black to move -> White cannot be in check.
    if ((game().getTurn() && isBlackInCheck) || !game().getTurn() && isWhiteInCheck)
    {
      return false;
    }

    return true;
  }

  
  //#endregion

  //#region Square highlight logic

  //For the coordinate, get whether it is right clicked or not.
  getRightClickedStatusForSquare(coordinate: string)
  {
    const idx = Chonse2.findIndexFromCoordinate(coordinate);
    
    return this.model().squareHighlightStatuses()[idx.rowIndex][idx.colIndex];
  }

  //Sets all the right clicked statuses to false, clearing any right clicked squares.
  resetClickedSquares()
  {
    if (this.model().squareHighlightStatuses().length == 0)
    {
      for(let i = 0; i < ChessConstants.SIZE; i++)
      {
        const rank: Array<boolean> = [];
        for(let j = 0; j < ChessConstants.SIZE; j++)
        {
          rank.push(false);
        }
        this.model().squareHighlightStatuses().push(rank);
      }
    }
    else 
    {
      for(let i = 0; i < ChessConstants.SIZE; i++)
      {
        const rank = this.model().squareHighlightStatuses()[i];
        for(let j = 0; j < ChessConstants.SIZE; j++)
        {
          rank[j] = false;
        }
        this.model().squareHighlightStatuses().push(rank);
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
