import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, ElementRef, input, Input, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { Square } from '../square/square';
import { BoardPlayerInfo } from "../board-player-info/board-player-info";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PromotionModal } from '../promotion-modal/promotion-modal';
import { CommonModule } from '@angular/common';
import LocalStorageHelper from './local-storage-helper';
import { FormsModule } from '@angular/forms';
import { ChessBoardService as ChessBoardService } from './chess-board-service';
import {Arrow, ArrowColors, ArrowContext, createArrow } from './arrow';
import BoardState from './board-state';
import Sound from './sound';
import { ImportModal } from '../import-modal.ts/import-modal';
import { ToastrService } from 'ngx-toastr';
import { PgnComments } from './pgn-misc';
import { EvalBar } from '../eval-bar/eval-bar';
import MoveClassificationList from './move-classification-list';
import { Router } from '@angular/router';
import VsAiConfigurationModalHelper from '../../vs-ai/vs-ai-configuration-modal-helper';
import ThemeService from '../../themes/theme-service';
import { EvaluationChart } from '../evaluation-chart/evaluation-chart';
import { CopyPgnModal } from '../copy-pgn-modal/copy-pgn-modal';
import Chonse2 from '../../../libs/chonse2-lib/chonse2';
import { GameOverReason, GameScore } from '../../../libs/chonse2-lib/game-state';
import { PieceColor } from '../../../libs/chonse2-lib/piece-color';
import { PieceType } from '../../../libs/chonse2-lib/piece-type';
import { getEvaluationBarValue2 } from '../../../libs/engine-lib/helpers/chessHelper';
import { EngineName, EngineInformation, EngineType, MoveClassification, moveClassificationLabels } from '../../../libs/engine-lib/types/enums';
import { EvalSource } from '../../../libs/engine-lib/types/eval';
import { UciEngine } from '../../../libs/engine-lib/uciEngine';
import MoveResult from './move-result';
import Chonse2Extensions from '../../../libs/chonse2-lib/extensions';
import { BoardArrowButtons } from '../board-arrow-buttons/board-arrow-buttons';
import { BoardOptions } from '../board-options/board-options';
import { MovesTable } from '../moves-table/moves-table';
import { EngineLineDisplay } from "../engine-line-display/engine-line-display";
import { GameInfo } from "../game-info/game-info";
import { MoveOverview } from "../move-overview/move-overview";
import { CoachDisplay } from "../coach-display/coach-display";
import ChessboardHelper from '../helpers';
import { CompactBoardPlayerInfo } from '../compact-board-player-info/compact-board-player-info';
import { ProgressToast } from '../progress-toast/progress-toast';
import GameLinkHelper from './game-link-helper';
import { DatabaseModal } from '../database-modal/database-modal';

@Component({
  selector: 'app-chessboard',
  imports: [
    MovesTable,
    Square,
    BoardArrowButtons,
    BoardOptions,
    BoardPlayerInfo,
    CompactBoardPlayerInfo,
    CommonModule,
    FormsModule,
    EvalBar,
    EvaluationChart,
    EngineLineDisplay,
    GameInfo,
    MoveOverview,
    CoachDisplay,
    ProgressToast
],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Chessboard implements OnInit, AfterViewInit, OnDestroy {
  pieceType = PieceType;
  PieceColor = PieceColor;
  GameOverReason = GameOverReason;
  LocalStorageHelper = LocalStorageHelper;
  EngineName = EngineName;
  EngineInformation = EngineInformation;
  EngineType = EngineType;
  EvalSource = EvalSource;
  Chonse2Extensions = Chonse2Extensions;
  Object = Object;
  MoveClassification = MoveClassification;
  moveClassificationLabels = moveClassificationLabels;
  Chessboard = Chessboard;
  Math = Math;

  COORDS: Array<Array<string>> = Chonse2.COORDS;

  //Game service ID
  gameId = input<string>("")

  //State
  boardState = signal<BoardState>(null!);
  
  //Controls
  activeTab = signal<'moves' | 'overview'>('moves');

  //MOVE PROPERTIES
  currentLegalMoves = signal<string[]>([]);
  currentlyHeldPiece = signal<string>('');
  fromSquare = signal<string>('');
  toSquare = signal<string>('');
  fromRightClickSquare = signal<string>('');
  toRightClickSquare = signal<string>('');

  //COSMETIC
  private readonly _ARROW_PULLBACK = 0.18;
  private resizeObserver: ResizeObserver;
  mouseX = signal(0);
  mouseY = signal(0);
  //arrows = signal<Arrow[]>([]);
  @ViewChild('board', { static: false }) boardElement!: ElementRef<HTMLDivElement>;
  boardPixelSize = signal(0);
  animatedPiece = signal('');
  animatedPieceX = signal(0);
  animatedPieceY = signal(0);
  static animationDuration = 125; // ms
  animatedPieceCoord = signal('');

  static readonly moveClassificationColors: Map<string, string> = new Map<string, string>( 
    [
      [MoveClassification.Opening, "Gray"],
      [MoveClassification.Forced, "Gray"],
      [MoveClassification.Luminous, "MediumTurquoise"],
      [MoveClassification.Perfect, "fuchsia"],
      [MoveClassification.Best, "LimeGreen"],
      [MoveClassification.Excellent, "LimeGreen"],
      [MoveClassification.Okay, "OliveDrab"],
      [MoveClassification.Inaccuracy, "Gold"],
      [MoveClassification.Mistake, "DarkOrange"],
      [MoveClassification.Blunder, "DarkRed"],
      [MoveClassification.Miss, "IndianRed"],
      [MoveClassification.None, "None"]
    ]
  )

  constructor(
    private modalService: NgbModal, 
    private chessBoardService: ChessBoardService, 
    private toastr: ToastrService,
    private router: Router,
    public themeService: ThemeService,
    public cdr: ChangeDetectorRef)
  {
    //Board state stored in service to persist across routerlink changes.
    const boardState: BoardState = this.chessBoardService.getGame(this.gameId());

    this.boardState.set(boardState);

    this.resizeObserver = new ResizeObserver( () =>
    {
      this.updateBoardSize();
    } )

  }

  async ngOnInit(): Promise<void> {

    const boardState: BoardState | undefined = this.chessBoardService.getGame(this.gameId());
    if (!boardState) {
        //Not loading component if there is no game.
        console.warn(`Game ${this.gameId} not found yet`);
        return;
    }
    this.boardState.set(boardState);

    if (this.boardState().doEvaluateGame() && !this.boardState().engine())
    {
      await this.boardState().evaluateGame();
      this.boardState().divergenceStateStack.set([]);
      this.boardState().divergenceMoveStack.set([]);
    }
  }

  ngAfterViewInit(): void 
  {
    if (this.boardElement)
    {
      this.resizeObserver.observe(this.boardElement.nativeElement);

      this.updateBoardSize();
    }
  }

  ngOnDestroy(): void 
  {
    this.resizeObserver.disconnect();  
  }

  async completeMove(fromSquare: string, toSquare: string)
  {
    //If the game is vs AI and there is no engine, don't move anything
    if (this.boardState().isVsAi() && !this.boardState().engine())
    {
      return;
    }

    //Can't move if, in AI mode, it isn't the player's turn.
    if (this.boardState().isVsAi())
    {
      //If we aren't diverging:
      if (this.getMostCurrentMainState() == this.boardState().getCurrentState())
      {
        if ((this.getMostCurrentMainState().turn && !this.boardState().humanPlayerIsWhite()) || (!this.getMostCurrentMainState().turn && this.boardState().humanPlayerIsWhite()))
        {
          return;
        }
      }
    }

    const isClickToMove = LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE, false);
    
    let piece = "";

    if (isClickToMove)
    {
      const idx = Chonse2.findIndexFromCoordinate(fromSquare);
      piece = this.boardState().getCurrentState().pieceState[idx.rowIndex][idx.colIndex];
    }
    else 
    {
      piece = this.currentlyHeldPiece();
    }
    
    if (!this.currentLegalMoves().includes(toSquare))
    {
      return;
    }
    
    const stateCopy = this.boardState().getCurrentState().getFullDeepCopy();

    const isPromotion = (
      piece == PieceType.WHITE_PAWN && this.toSquare().includes(Chonse2.WHITE_PAWN_PROMOTE_RANK.toString()) ||
      piece == PieceType.BLACK_PAWN && this.toSquare().includes(Chonse2.BLACK_PAWN_PROMOTE_RANK.toString()))

    let moveResult: MoveResult = new MoveResult();

    //handle pawn promotion if the pawn is at the opposite rank=.
    if (isPromotion)
    {
      //color to show on the dialog is derived.
      const promotionPieceColor = this.currentlyHeldPiece() == PieceType.WHITE_PAWN ? PieceColor.WHITE : PieceColor.BLACK;

      //open the modal and set the color.
      const modalRef = this.modalService.open(PromotionModal, {size: 'xl'});
      modalRef.componentInstance.color = promotionPieceColor;

      //gets the result of that dialog.
      modalRef.result.then( async (result) =>
      {
        //perform the move and promote to what the user selected.
        moveResult = MoveResult.createMoveResultFromInterface(stateCopy.completeMove(fromSquare, toSquare, result));

        await this.boardState().pushState(stateCopy, moveResult);
        
        if (this.boardState().isVsAi() && this.getMostCurrentMainState() == this.boardState().getCurrentState())
        {
          this.playAIMove();
        }

      } )
      .catch( async () =>
      {
        //if the dialog was forced closed, promote to queen by default.
        moveResult = MoveResult.createMoveResultFromInterface(stateCopy.completeMove(fromSquare, toSquare, PieceType.QUEEN));

        await this.boardState().pushState(stateCopy, moveResult);

                
        if (this.boardState().isVsAi() && this.getMostCurrentMainState() == this.boardState().getCurrentState())
        {
          this.playAIMove();
        }
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
      moveResult = MoveResult.createMoveResultFromInterface(stateCopy.completeMove(fromSquare, toSquare, piece));
      this.boardState().pushState(stateCopy, moveResult);
        
      if (this.boardState().isVsAi() && this.getMostCurrentMainState() == this.boardState().getCurrentState())
      {
        this.playAIMove();
      }

      //Resets the state of the from/to squares and current piece back to nothing.
      this.resetMoveState();
    }
    
    Sound.playSoundForMove(moveResult.notation);
  }


  resetMoveState()
  {
    this.fromSquare.set("");
    this.toSquare.set("");
    this.currentLegalMoves.set([]);
  }

  //#region Import/Reset/Analyze/Copy PGN
  handleImportClicked()
  {
    const ref = this.modalService.open
    (
      ImportModal, 
      
      {
        size: 'lg',
      }
    );

    ref.result.then( async result => 
      {
        try 
        {
          //Create a new instance to put the game in.
          const newBoard: BoardState = BoardState.parsePGN(result.pgn);
          newBoard.doEvaluateGame.set(true);
          
          //Remove the old one and add the new one.
          this.chessBoardService.deleteGame(this.gameId());
          this.chessBoardService.addGame(this.gameId(), newBoard);

          if (result.username)
          {
            if (result.username.toLowerCase() != newBoard.pgnHeaders().white.toLowerCase())
            {
              newBoard.isFlipped.set(true);
            }
          }

          //Update current component state.
          this.boardState.set(this.chessBoardService.getGame(this.gameId()));

          //User feedback
          this.toastr.success("Successfully imported PGN.");

          await this.boardState().evaluateGame();

          this.boardState().divergenceStateStack.set([]);
          this.boardState().divergenceMoveStack.set([]);

          //save as the most recent pgn analyzed
          LocalStorageHelper.setString(LocalStorageHelper.LAST_PGN, GameLinkHelper.compressStringForUrl(result.pgn));
        }
        catch(ex)
        {
          console.log(ex)
          this.toastr.error("Invalid PGN data.");
        }
      }
    )
    .catch(err => 
      {
        //this.toastr.warning("Operation cancelled.");
      }
    )
  }

  handleResetClicked()
  {
    this.boardState().isCoachMoveShowing.set(false);
    this.boardState().isCoachIdeaShowing.set(false);

    const bs: BoardState = new BoardState();
    this.chessBoardService.deleteGame(this.gameId());
    this.chessBoardService.addGame(this.gameId(), bs);
    this.boardState.set(this.chessBoardService.getGame(this.gameId()));
    this.boardState().arrows.set([]);
  }
  //#endregion

  //#region Eval
  getEvalProgress = computed( (): number => 
  {
    return Number(this.boardState().evalProgress().toFixed(2));
  } )

  getEngineDisplayName = computed( (): string => 
  {
    if (this.boardState().engine)
    {
      const eName = EngineInformation.get(this.boardState().engine()?.name ?? UciEngine.DEFAULT_ENGINE)?.displayName;

      if (eName)
      {
        return eName;
      }
    }
    return "what the hell are you analyzing this with then?";
  }) 

  getMoveClassificationForSquare = (coord: string) => computed( (): MoveClassification =>
  {
    const lastEval = this.boardState().getMostRecentEval();

    if (!this.boardState().engine()?.getIsReady())
    {
      return MoveClassification.None;
    }

    if (lastEval)
    {
      const lastMove = this.boardState().getMostRecentMove();
      const classification: MoveClassification = lastEval.moveClassification ?? MoveClassification.None;

      if (lastMove.fromCoord == coord || lastMove.toCoord == coord)
      {
        return classification
      }
    }

    return MoveClassification.None;
  }) 
  
  getMoveClassificationIconSourceForCoord = (coord: string) => computed( (): string =>
  {
    const lastEval = this.boardState().getMostRecentEval();
    
    if (!this.boardState().engine()?.getIsReady())
    {
      return "";
    }

    if (lastEval)
    {
      if (lastEval.moveClassification)
      {
        const mostRecentMove = this.boardState().getMostRecentMove();

        if (mostRecentMove.toCoord == coord)
        {
          return ChessboardHelper.getIconSourceForMoveClassification(lastEval.moveClassification)();
        }   
      }
    }
    return "";
  } )

  getPastEngineArrow = computed( (): Arrow | null => 
  {
    if (this.boardState().isCoachMoveShowing())
    {
      return null;
    }

    const bestMove = this.boardState().getPreviousMostRecentEval()?.bestMove;

    if (bestMove)
    {
      const from = bestMove[0] + bestMove[1];
      const to = bestMove[2] + bestMove[3];

      const arrow = createArrow(from, to, ArrowColors.PAST_BEST_MOVE, ArrowContext.Engine);

      return arrow;
    }

    return null;
  } ) 

  getFutureEngineArrow = computed( (): Arrow | null =>
  {
    if (this.boardState().isCoachMoveShowing())
    {
      return null;
    }

    const bestMove = this.boardState().getMostRecentEval()?.bestMove;

    if (bestMove)
    {
      const from = bestMove[0] + bestMove[1];
      const to = bestMove[2] + bestMove[3];

      const arrow = createArrow(from, to, ArrowColors.FUTURE_BEST_MOVE, ArrowContext.Engine);

      return arrow;
    }

    return null;
  } ) 

  getEvalBarData = computed( (): {whiteBarPercentage: number, label: string} =>
  {
    const e = this.boardState().getMostRecentEval();
    const state = this.boardState().getCurrentState();

    if (e)
    {
      const data = getEvaluationBarValue2(e, state.gameState.gameScore);
      return data;
    }
    else 
    {
      const pe = this.boardState().getPreviousMostRecentEval();
      if (pe)
      {
        const data = getEvaluationBarValue2(pe, state.gameState.gameScore);
        return data;
      }
    }

    return {whiteBarPercentage: 51, label: "0.4"};
  })

  onGraphClicked(idx: number)
  {
    this.moveClicked(idx);
  }

  getImageSourceForEnginePiece = (coord: string) => computed( (): string =>
  {
    if (!coord)
    {
      return "";
    }

    if (coord.length < 2)
    {
      return "";
    }

    const fromCoord: string = coord[0] + coord[1];
    const idx = Chonse2.findIndexFromCoordinate(fromCoord);

    const piece: string = this.boardState().getCurrentState().pieceState[idx.rowIndex][idx.colIndex];

    return `piece/merida/${piece}.svg`;
  }) 

  //#endregion
  //#endregion

  //#region Vs AI
  async playAIMove()
  {
    if (this.getMostCurrentMainState().gameState.isGameOver)
    {
      return;
    }

    const engine = this.boardState().engine();

    //Can't play an engine move if there is no engine.
    if (!engine)
    {
      this.toastr.error("Error: Engine not initialized.");
      return;
    }

    //Sets up the params to query the engine.
    const depth = LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.DEFAULT_DEPTH);
    const fen = this.getMostCurrentMainState().getFEN();
    const elo = this.boardState().aiElo();
              
    //Asks the engine for its move.
    const engineResult = await engine.getEngineNextMove(fen, elo, depth);
    
    //If the engine couldn't find something, display an error.
    if (!engineResult)
    {
      this.toastr.error("Error: Engine move not found.");
      return;
    }

    //Coordinates and promotion if applicable.
    const fromSquare = engineResult[0] + engineResult[1];
    const toSquare = engineResult[2] + engineResult[3];
    const promotion = engineResult[4] ? engineResult[4].toUpperCase() : PieceType.QUEEN;

    //The state to be pushed to the stack.
    const stateCopy = this.boardState().getCurrentState().getFullDeepCopy();
    
    const fromIdx = Chonse2.findIndexFromCoordinate(fromSquare);
    const pieceToAnimate = this.getMostCurrentMainState().pieceState[fromIdx.rowIndex][fromIdx.colIndex];
    
    if (LocalStorageHelper.getBoolean(LocalStorageHelper.PIECE_ANIMATIONS, true))
    {
      this.animateMove(fromSquare, toSquare, pieceToAnimate);
      setTimeout( () => 
      {
        const moveResult = MoveResult.createMoveResultFromInterface(stateCopy.completeMove(fromSquare, toSquare, promotion));
        this.forcePushState(stateCopy, moveResult);
        Sound.playSoundForMove(moveResult.notation);
      }, Chessboard.animationDuration);
    }
    else 
    {
        const moveResult = MoveResult.createMoveResultFromInterface(stateCopy.completeMove(fromSquare, toSquare, promotion));
        this.forcePushState(stateCopy, moveResult);
        Sound.playSoundForMove(moveResult.notation);
    }

  }

  resignVsAiClicked()
  {
    const gameState = this.getMostCurrentMainState().gameState;

    gameState.isGameOver = true;
    gameState.reason = GameOverReason.Resignation;
    gameState.gameScore = this.boardState().humanPlayerIsWhite() ? GameScore.BLACK_WON : GameScore.WHITE_WON;

    this.toastr.warning("You resigned.");
  }

  beginGameVsAiClicked()
  {
    VsAiConfigurationModalHelper.doModal(this.modalService, this.chessBoardService, this.toastr, this);
  }

  analyzeAiGameClicked()
  {
    const states = this.boardState().mainStateStack().map( s => s.getFullDeepCopy() );
    const gameStates = this.boardState().mainStateStack().map( s => structuredClone(s.gameState) );
    const moves = this.boardState().mainMoveStack().map(m => structuredClone(m));
    const pgnHeaders = structuredClone(this.boardState().pgnHeaders());

    this.router.navigate(['/analysis'], {state: { "vsAiStates": states, "vsAiGameStates": gameStates, "vsAiMoves": moves, "vsAiPgnHeaders": pgnHeaders}});
  }

  getMostCurrentMainState()
  {
    return this.boardState().mainStateStack()[this.boardState().mainStateStack().length - 1];
  }

  forcePushState(state: Chonse2, moveResult: MoveResult)
  {
    this.boardState().mainStateStack.update( stack => [...stack, state]);
    
    this.boardState().mainMoveStack.update( stack => [...stack, moveResult] );
    
    this.boardState().mainStackPointer.update(ptr => ptr + 1);
  }
  //#endregion

  //#region Controls
  handleFlipClicked()
  {
    this.boardState().isFlipped.update( f => !f );
  }

  handleDoubleBackButtonClicked()
  {
    Sound.playSound(Sound.MOVE);
    this.boardState().goBackToStart();
  }

  handleBackButtonClicked()
  {
    const mostRecentMove = this.boardState().getMostRecentMove();

    if (LocalStorageHelper.getBoolean(LocalStorageHelper.PIECE_ANIMATIONS, true))
    {
      this.animateMove(mostRecentMove.toCoord, mostRecentMove.fromCoord, mostRecentMove.piece);

      setTimeout( () =>
      {
        this.boardState().goBack();
        Sound.playSound(Sound.MOVE);

      }, Chessboard.animationDuration )
    }    
    else 
    {
      this.boardState().goBack();
      Sound.playSound(Sound.MOVE);
    }

  }

  handleForwardButtonClicked()
  {
    const mostRecentMove = this.boardState().getFutureMove();

    if (LocalStorageHelper.getBoolean(LocalStorageHelper.PIECE_ANIMATIONS, true))
    {
      this.animateMove(mostRecentMove.fromCoord, mostRecentMove.toCoord, mostRecentMove.piece);
      setTimeout( () =>
      {
        this.boardState().goForward();
        Sound.playSoundForMove(mostRecentMove.notation);

      }, Chessboard.animationDuration )
    }
    else 
    {
      this.boardState().goForward();
      Sound.playSoundForMove(mostRecentMove.notation);
    }

  }   

  handleDoubleForwardButtonClicked()
  {
    this.boardState().goForwardToEnd();
    Sound.playSound(Sound.CAPTURE);
  }

  //Should the back buttons be enabled
  areBackButtonsEnabled = computed( (): boolean  =>
  {
    if (this.boardState().isCoachMoveShowing())
    {
      return false;
    }

    if (this.boardState().isCoachIdeaShowing())
    {
      return false;
    }

    return this.boardState().mainStackPointer() != 0 || this.boardState().divergenceStateStack().length != 0;
  })

  areForwardButtonsEnabled = computed( (): boolean =>
  {
    if (this.boardState().isCoachMoveShowing())
    {
      return false;
    }

    if (this.boardState().isCoachIdeaShowing())
    {
      return false;
    }

    //If we are deviating from the main game (by going back) then you can't logically go forward.
    if (this.boardState().divergenceStateStack().length != 0)
    {
      return false;
    }

    //If there are no more moves left after this, then you can't go back.
    if (this.boardState().mainStackPointer() == this.boardState().mainStateStack().length - 1)
    {
      return false;
    }

    return true;
  })
  
  moveClicked(index: number)
  {
    if (this.boardState().isCoachMoveShowing())
    {
      return;
    }

    if (this.boardState().isCoachIdeaShowing())
    {
      return;
    }

    if (this.boardState().divergenceStateStack().length != 0)
    { 
      this.boardState().goBackToStart();
    }

    this.boardState().mainStackPointer.set(index);
    this.cdr.markForCheck();
  }

  moveClassificationClicked(color: PieceColor, classification : MoveClassification)
  {
    const list: MoveClassificationList = color == PieceColor.WHITE ? this.boardState().whiteMoveClassificationList() : this.boardState().blackMoveClassificationList();
    
    const entry = list.moves.get(classification);
    
    if (entry)
    {
      if (entry.arr.length == 0)
      {
        return;
      }

      const idx = entry.arr[entry.ptr];
      entry.ptr = (entry.ptr + 1) % entry.arr.length;

      this.moveClicked(idx);
    }
  }

  getClockForPlayer = (color: string) => computed ( (): string =>
  {
    const stackPtr = this.boardState().mainStackPointer();
    const moveStack = this.boardState().mainMoveStack();

    for(let i = stackPtr; i > 0; i--)
    {
      const move: IMoveResult = moveStack[i];
      if (!move)
      {
        continue;
      }

      if (!move.piece.startsWith(color))
      {
        if (move.pgnComment.startsWith(PgnComments.CLOCK))
        {
          return move.pgnComment.replace(PgnComments.CLOCK, "");
        }
      }
    }
      return ""
  } ) 

  async handleAnalyzeClicked()
  {
    this.boardState().doEvaluateGame.set(true);
    await this.boardState().evaluateGame();
    this.boardState().divergenceStateStack.set([]);
    this.boardState().divergenceMoveStack.set([]);
    this.boardState().isReadOnly.set(true);
  }

  async exportGameClicked(): Promise<void>
  {
    const modalRef = this.modalService.open(CopyPgnModal);
    modalRef.componentInstance.pgn = this.boardState().exportPGN();
  }

  async saveToDbClicked(): Promise<void>
  {
    const modalRef = this.modalService.open(DatabaseModal);
    modalRef.componentInstance.game.set(this.boardState());
  }
  //#endregion

  //#region Left click/pointer
  onSquareLeftClick = () =>
  {
    this.resetClickedSquares();
    //this.arrows.set(this.arrows().filter( a => a.context != ArrowContext.Player));
    this.boardState().arrows.set(this.boardState().arrows().filter( a => a.context != ArrowContext.Player));
  }

  onSquareMouseDown(event: { coordinate: string, piece: string, mouse: PointerEvent })
  {
    if (this.boardState().isLocked())
    {
      return;
    }

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
        this.fromSquare.set(event.coordinate);
        this.currentlyHeldPiece.set(event.piece);

        if (event.piece != "")
        {
          this.handleDragImage(event.mouse);
        }    
      }

      //property will display legal moves on the screen.
      this.currentLegalMoves.set(this.boardState().getCurrentState().getLegalMoves(event.coordinate));
    }

    //Right click for square highlight or arrow drawing
    if (event.mouse.button == 2)
    {
      this.fromRightClickSquare.set(event.coordinate);
    }
  }

  onSquareMouseUp(event: { coordinate: string, mouse: PointerEvent })
  {
    if (this.boardState().isLocked())
    {
      return;
    }

    if (event.mouse.button == 0)
    {
      //If this is click to move mode
      if (LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE))
      {
        //If the fromsquare has not been selected, we should set it and compute its legal moves.
        if (this.fromSquare() == "")
        {
          this.fromSquare.set(event.coordinate);
          this.currentLegalMoves.set(this.boardState().getCurrentState().getLegalMoves(this.fromSquare()));

          //If it has no legal moves, reset the state to reduce the number of clicks required when switching to another piece.
          if (this.currentLegalMoves().length == 0)
          {
            this.resetMoveState();
          }

          //Return so that the toSquare logic cannot be triggered.
          return;
        }

        //If the toSquare is empty and we got this far, the user would like to move to this square.
        if (this.toSquare() == "")
        {
          this.toSquare.set(event.coordinate);

          //If it is not legal, reset the state and disregard the from square, or complete the move if it is legal.
          if (!this.currentLegalMoves().includes(this.toSquare()))
          {
            this.resetMoveState();
          }
          else
          {
            this.completeMove(this.fromSquare(), this.toSquare());
          }
        }
        return;
      }

      //If it is not click to move mode:
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
      if (this.fromRightClickSquare() == this.toRightClickSquare())
      {
        //Gets the index of the square to highlight.
        const idx = Chonse2.findIndexFromCoordinate(this.toRightClickSquare());

        //Sets the status telling it to change color.
        this.boardState().squareHighlightStatuses.update(grid =>
        {
            const copy = grid.map(r => [...r]);
            copy[idx.rowIndex][idx.colIndex] = !copy[idx.rowIndex][idx.colIndex];
            return copy;
        });
      }
      else //If the squares are different, they are drawing an arrow.
      {
        const arrow = createArrow(this.fromRightClickSquare(), this.toRightClickSquare());
        
        if (arrow)
        {
          this.boardState().arrows.set([...this.boardState().arrows() , arrow]); 
        }
      }

      this.fromRightClickSquare.set('');
      this.toRightClickSquare.set('');
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
  //#endregion

  //#region Square highlighting

  //For the coordinate, get whether it is right clicked or not.
  getRightClickedStatusForSquare = (coordinate: string) => computed( () =>
  {
    const idx = Chonse2.findIndexFromCoordinate(coordinate);
    
    return this.boardState().squareHighlightStatuses()[idx.rowIndex][idx.colIndex];
  } )

  //Sets all the right clicked statuses to false, clearing any right clicked squares.
  resetClickedSquares()
  {
    if (this.boardState().squareHighlightStatuses().length == 0)
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank: Array<boolean> = [];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank.push(false);
        }
        this.boardState().squareHighlightStatuses.update( st => [...st, rank] );
      }
    }
    else 
    {
      for(let i = 0; i < Chonse2.SIZE; i++)
      {
        const rank = this.boardState().squareHighlightStatuses()[i];
        for(let j = 0; j < Chonse2.SIZE; j++)
        {
          rank[j] = false;
        }
        this.boardState().squareHighlightStatuses.update( st => [...st, rank] );
      }
    }
  }
  //#endregion

  //#region Arrows
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

  //#endregion

  //#region Endgame square animation
  _isSquareEndgameKingSquare = (rankIndex: number, fileIndex: number) => computed((): boolean  => 
  {
    return this._isSquareCheckmatedKing(rankIndex, fileIndex)() || this._isSquareWinningKing(rankIndex, fileIndex)() || this._isSquareKingInDraw(rankIndex, fileIndex)();
  })

  _isSquareCheckmatedKing = (rankIndex: number, fileIndex: number) => computed( (): boolean =>
  {
    return (this.boardState().getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING && this.boardState().getCurrentState().gameState.winner == PieceColor.BLACK) || (this.boardState().getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING && this.boardState().getCurrentState().gameState.winner == PieceColor.WHITE) && this.boardState().getCurrentState().gameState.reason == GameOverReason.Checkmate;
  })

  _isSquareWinningKing = (rankIndex: number, fileIndex: number) => computed( (): boolean => 
  {
    return (this.boardState().getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING && this.boardState().getCurrentState().gameState.winner == PieceColor.WHITE) || (this.boardState().getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING && this.boardState().getCurrentState().gameState.winner == PieceColor.BLACK); 
  } )

  _isSquareKingInDraw = (rankIndex: number, fileIndex: number) => computed( (): boolean => 
  {
    return this.boardState().getCurrentState().gameState.isDraw() && (this.boardState().getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.WHITE_KING || this.boardState().getCurrentState().pieceState[rankIndex][fileIndex] == PieceType.BLACK_KING);
  })

  _getEndgameSquareBackgroundColor = (rankIndex: number, fileIndex: number) => computed( (): string => 
  {
    if (this._isSquareCheckmatedKing(rankIndex, fileIndex)())
    {
      return "red";
    }

    if (this._isSquareKingInDraw(rankIndex, fileIndex)())
    {
      return "skyblue"
    }

    if (this._isSquareWinningKing(rankIndex, fileIndex)())
    {
      return "limegreen";
    }

    return "transparent";
  })

  _getEndgameSquareImgSrc = (rankIndex: number, fileIndex: number) => computed( (): string =>
  {
    const base = "icons/";

    if (this._isSquareCheckmatedKing(rankIndex, fileIndex)())
    {
      return base + "checkmate.webp";
    }

    if (this._isSquareKingInDraw(rankIndex, fileIndex)())
    {
      return base + "draw.webp"
    }

    if (this._isSquareWinningKing(rankIndex, fileIndex)())
    {
      return base + "winner.webp";
    }

    return "";
  })

  _getEndgameSquareText = (rankIndex: number, fileIndex: number) => computed( (): string =>
  {
    if (this._isSquareCheckmatedKing(rankIndex, fileIndex)())
    {
      return "Checkmate";
    }

    if (this._isSquareWinningKing(rankIndex, fileIndex)())
    {
      return "Winner";
    }

    if (this._isSquareKingInDraw(rankIndex, fileIndex)())
    {
      return "Draw";
    }

    return "";
  })
  //#endregion
  
  //#region Animation for luminous/perfect squares
  _getLuminousOrPerfectSquareText = (classification: MoveClassification) => computed( (): string =>
  {
    if (classification == MoveClassification.Luminous)
    {
      return "LUM1NOUS!";
    }

    if (classification == MoveClassification.Perfect)
    {
      return "Perfect!";
    }

    return "Null";
  });

  _getLuminousOrPerfectBackgroundColor = (classification: MoveClassification) => computed( (): string =>
  {
    if (classification == MoveClassification.Luminous)
    {
      return "darkcyan";
    }

    if (classification == MoveClassification.Perfect)
    {
      return "fuchsia";
    }

    return "white";
  })
  //#endregion

  //#region Animation for piece movement logic

  updateBoardSize()
  {
    if (!this.boardElement)
    {
      return;
    }

    this.boardPixelSize.set(this.boardElement.nativeElement.getBoundingClientRect().width);
  }
  
  getBoardTopLeft = computed( (): { left: number; top: number }  => 
  {
    const rect = this.boardElement.nativeElement.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  })

  getBoardPixelSize = computed( (): number => 
  {
    return this.boardPixelSize();
  }) 

  getSquarePixelSize = computed( (): number => 
  {
    return this.boardPixelSize() / Chonse2.SIZE;
  })

  animateMove(from: string, to: string, piece: string) 
  {
    //calculate the pixel coordinates for from and to, in order to know how to animate it.
    const fromCoords = this.calculatePixelPosition(from);
    const toCoords = this.calculatePixelPosition(to);

    //set piece state
    this.animatedPieceCoord.set(from);
    this.animatedPiece.set(piece);
    this.animatedPieceX.set(fromCoords.x);
    this.animatedPieceY.set(fromCoords.y);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.animatedPieceX.set(toCoords.x);
        this.animatedPieceY.set(toCoords.y);
      });
    });

    //if the animation takes longer than 500ms, force-clear it, prevents the piece from staying 'invisible' on the main board
    setTimeout(() => {
      if (this.animatedPiece() === piece) {
        this.onAnimationEnd();
      }
    }, 500); 
  }

  private calculatePixelPosition(coordinate: string): { x: number, y: number } 
  {
    const { rowIndex, colIndex } = Chonse2.findIndexFromCoordinate(coordinate);
    const squareSize = this.getSquarePixelSize();
    return {
      x: colIndex * squareSize,
      y: rowIndex * squareSize
    };
  }

  onAnimationEnd() 
  {
    this.animatedPiece.set("");
    this.animatedPieceCoord.set("");
  }
  //#endregion
  
}
