import { Component, computed, input, output, signal, WritableSignal } from '@angular/core';
import { EngineInformation, EngineType, MoveClassification, moveClassificationLabels } from '../../../libs/engine-lib/types/enums';
import { IconButton } from '../../ui/icon-button/icon-button';
import BoardState from '../chessboard/board-state';
import MoveResult from '../chessboard/move-result';
import { CoachIdea, CoachIdeaFlagType, CoachMoveFlagType, CoachMoveSequenceType, CoachResourceFlagType, CoachUtils } from '../../../libs/coach-lib/coach-utils';
import { EvalSource, LineEval, PositionEval } from '../../../libs/engine-lib/types/eval';
import { ArrowContext } from '../chessboard/arrow';
import ChessboardHelper from '../helpers';
import { CommonModule } from '@angular/common';
import ThemeService from '../../themes/theme-service';
import Chonse2 from '../../../libs/chonse2-lib/chonse2';
import LocalStorageHelper from '../chessboard/local-storage-helper';
import Sound from '../chessboard/sound';
import { Chessboard } from '../chessboard/chessboard';

@Component({
  selector: 'app-coach-display',
  imports: [IconButton, CommonModule],
  templateUrl: './coach-display.html',
  styleUrl: './coach-display.css',
})
export class CoachDisplay {
  protected readonly MoveClassification = MoveClassification;
  moveClassificationLabels = moveClassificationLabels;
  ChessboardHelper = ChessboardHelper;

  // --- Required Signal Inputs ---
  boardState = input.required<BoardState>();

  // --- Action Inputs (Callbacks) ---
  animateMove = output<{
  from: string;
  to: string;
  piece: string;
}>();

  //coach
  protected root = computed(() => this.boardState().getRootForFollowUp());
  protected progress = computed(() => this.boardState().evalProgress());
  protected quote = computed(() => this.boardState().displayedQuote());
  
  protected isShowingQuote = computed(() => {
    const p = this.progress();
    return p > 0 && p < 97.1;
  });
  
  //engine display
  protected readonly EngineType = EngineType;
  protected readonly EvalSource = EvalSource;
  protected readonly EngineInformation = EngineInformation;

  protected engine = computed(() => this.boardState().engine());
  protected mostRecentEval = computed(() => this.boardState().getMostRecentEval());
  protected shouldShowEngineInfo = computed(() => this.boardState().doEvaluateGame());

  protected engineMetadata = computed(() => {
    const engine = this.engine();
    return engine ? EngineInformation.get(engine.name) : null;
  });

  constructor(public themeService: ThemeService)
  {
    
  }

  //#region follow ups
  getFollowUpButtonText(move: MoveResult, ev: PositionEval): string
  {
    let mate = undefined;
    if (ev.lines[0])
    {
      mate = ev.lines[0].mate;
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.AllowedCheckmate) || mate)
    {
      return "Show checkmate";
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.LeftPieceHanging))
    {
      return "Show hanging piece";
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.OpportunityToFork))
    {
      return "Show fork";
    }

    return "Show follow-up";
  }

  showFollowUpClicked()
  {
    //Ensures that people can't click the buttons like crazy and mess up the states.
    this.boardState().disableCoachButtonsTemporarily();

    this.boardState().coachMoveSequenceType.set(CoachMoveSequenceType.FollowUp);
    this.doCoachMoveSequence();  
  }

  continueButtonClicked()
  {

  }

  async doCoachMoveSequence()
  {
    this.boardState().isLocked.set(true);

    //Ensures that people can't click the buttons like crazy and mess up the states.
    this.boardState().disableCoachButtonsTemporarily();

    this.boardState().isCoachMoveShowing.set(true);

    //Checks what the most recent eval was.
    const mostRecentEval: PositionEval | undefined = this.boardState().getMostRecentEval();

    //If we have it, we can show follow up.
    if (mostRecentEval)
    {
      //If the line actually exists, it can be followed.
      if (mostRecentEval.lines.length > 0)
      {
        //We only want the top engine line.
        const topEngineLine: LineEval = mostRecentEval.lines[0];

        //Sees how long it should actually iterate through.

        const iterationLength = topEngineLine.pv.length;

        for(let i = 0; i < iterationLength; i++)
        {
          if (this.boardState().isCoachMoveShowing())
          {
            //Retrieves the top engine move.
            const engineMove = topEngineLine.pv[i];

            //Clones the board so that the move can be played.
            const stateCopy = this.boardState().getCurrentState().getFullDeepCopy();

            //Converts the move.
            const {fromSquare, toSquare, promotion } = CoachUtils.convertUciToChonse2Move(engineMove);

            const currentState = this.boardState().getCurrentState();
            const rawPieceIndex = Chonse2.findIndexFromCoordinate(fromSquare);
            const piece = currentState.pieceState[rawPieceIndex.rowIndex][rawPieceIndex.colIndex];

            
            if (LocalStorageHelper.getBoolean(LocalStorageHelper.PIECE_ANIMATIONS, true))
            {
              //First, do the animation
              this.animateMove.emit({
                from: fromSquare,
                to: toSquare,
                piece
              });
              await this.delay(Chessboard.animationDuration);
            }

            //Then play the move.
            const moveResult = MoveResult.createMoveResultFromInterface(stateCopy.completeMove(fromSquare, toSquare, promotion));
            moveResult.coachComment = CoachUtils.COACH_MOVE_DELIMITER;
            Sound.playSoundForMove(moveResult.notation);

            //Then add it.
            this.boardState().pushState(stateCopy, moveResult, true);
            
            //Then wait one second for the next move.
            await this.delay(1000);
          }
          else 
          {
            break;
          }
        }
      }
    }

    this.boardState().isCoachMoveFinished.set(true);
  }
  
  delay(ms: number): Promise<void> 
  {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  hideSequence()
  {
    this.boardState().disableCoachButtonsTemporarily();

    //Stops someone from moving a piece manually.
    this.boardState().isLocked.set(false);

    //Gets the most recent move and stores it.
    let mostRecentMove = this.boardState().getMostRecentMove();
    
    //Pops every single thing that is a coach-played move.
    while(mostRecentMove.coachComment == CoachUtils.COACH_MOVE_DELIMITER)
    {
      this.boardState().goBack();
      mostRecentMove = this.boardState().getMostRecentMove();
    }

    //Sets flag so that the board can be used again.
    this.boardState().evaluationSessionId++;
    this.boardState().isCoachMoveShowing.set(false);
    this.boardState().isCoachMoveFinished.set(false);
    this.boardState().coachMoveSequenceType.set(CoachMoveSequenceType.None);
  }
  //#endregion

  //#region misses
  getMissButtonText(move: MoveResult): string
  {
    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedCheckmate))
    {
      return "Show missed checkmate";
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedFork))
    {
      return "Show missed fork";
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedHangingPiece))
    {
      return "Show missed capture";
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.CapturedPieceWithWrongAttacker))
    {
      return "Show alternative";
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedPin))
    {
      return "Show missed pin";
    }

    return "Show miss";
  }

  async showMissedOpportunityClicked()
  {
    //Ensures that people can't click the buttons like crazy and mess up the states.
    this.boardState().disableCoachButtonsTemporarily();

    this.boardState().coachMoveSequenceType.set(CoachMoveSequenceType.MissedOpportunity);

    //Gets previous state and eval
    const previousState = this.boardState().getPreviousMostRecentState().getFullDeepCopy();
    const previousEval = structuredClone(this.boardState().getPreviousMostRecentEval());
    const dummyResult = new MoveResult();
    dummyResult.notation = "-"
    dummyResult.coachComment = CoachUtils.COACH_MOVE_DELIMITER;

    //If they exist, push to divergence stack temporarily (creating a fake rollback)
    if (previousEval && previousState)
    {
      this.boardState().divergenceStateStack.update( s => [...s, previousState] );
      this.boardState().divergenceMoveStack.update( s=> [...s, dummyResult] );
      this.boardState().divergenceEvalStack.update( s => [...s, previousEval] )

      this.doCoachMoveSequence();
    }
  }

  //#endregion

  //#region ideas
  getIdeaButtonText(flag: CoachIdeaFlagType)
  {
    const BASE = "Show Idea: ";

    if (flag == CoachIdeaFlagType.ForkIdea)
    {
      return BASE + "Fork";
    }

    if (flag == CoachIdeaFlagType.PinIdea)
    {
      return BASE + "Pinned Piece";
    }

    if (flag == CoachIdeaFlagType.CentralControlIdea)
    {
      return BASE + "Center Pressure"
    }

    if (flag == CoachIdeaFlagType.DevelopmentIdea)
    {
      return BASE + "Development"
    }

    if (flag == CoachIdeaFlagType.FianchettoIdea)
    {
      return BASE + "Fianchetto"
    }
    return BASE;
  }

  showIdeaButtonClicked(idea: CoachIdea | undefined)
  {
    if (!idea)
    {
      return;
    }

    this.boardState().isLocked.set(true);
    this.boardState().isCoachIdeaShowing.set(true);
    this.boardState().arrows.set([...this.boardState().arrows(), ...idea.arrows] );
    this.highlightOrUnhilightCoords(idea.highlightedSquares, true);
  }

  hideIdeaButtonClicked()
  {
    this.boardState().isCoachIdeaShowing.set(false);
    this.boardState().isLocked.set(false);
    this.boardState().arrows.set(this.boardState().arrows().filter( a => a.context != ArrowContext.Coach));
    this.clearHighlights();
  }
  
  //#endregion

  //#region resources
  getResourceButtonText(flag: CoachResourceFlagType)
  {
    if (flag == CoachResourceFlagType.Opening)
    {
      return "Opening: Learn More";
    }

    return "Unknown resource"
  }

  handleResourceButtonClicked(link: string | undefined)
  {
    if (!link)
    {
      return;
    }
    
    window.open(link, '_blank');
  }
  //#endregion

  //#region highlights
  //highlights or unhighlights the passed in coordinates, boolean controls highlight/unhighlight.,
  highlightOrUnhilightCoords(coords: Array<string>, val: boolean)
  {
    const highlightIndices = coords.map( coord => 
      {
        return Chonse2.findIndexFromCoordinate(coord);
      }
    )

    this.boardState().squareHighlightStatuses.update(grid =>
    {
      //copy to trigger signal update.
      const copy = grid.map(r => [...r]);

      //for each row and column in the board.
      for(let row = 0; row < copy.length; row++)
      {
        const currentRow = copy[row];

        for(let col = 0; col < currentRow.length; col++)
        {
          //if the square should be highlighted (present in the indices), highlight/unhighlight it.
          const matchingIndices = highlightIndices.some(rc => 
          { 
            return rc.rowIndex == row && rc.colIndex == col 
          });

          if (matchingIndices)
          {
            currentRow[col] = val;
          }
        }
      }

        return copy;
    });
  }

  clearHighlights()
  {
    this.boardState().squareHighlightStatuses.update(grid =>
    {
      //copy to trigger signal update.
      const copy = grid.map(r => [...r]);

      //for each row and column in the board.
      for(let row = 0; row < copy.length; row++)
      {
        const currentRow = copy[row];

        for(let col = 0; col < currentRow.length; col++)
        {
          currentRow[col] = false;
        }
      }

        return copy;
    });
  }
  //#endregion
}
