import { Component, computed, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { EngineInformation, EngineType, MoveClassification } from '../../../libs/engine-lib/types/enums';
import { IconButton } from '../../ui/icon-button/icon-button';
import BoardState from '../chessboard/board-state';
import MoveResult from '../chessboard/move-result';
import { EvalSource, LineEval, PositionEval } from '../../../libs/engine-lib/types/eval';
import { ArrowContext } from '../chessboard/arrow';
import ChessboardHelper from '../helpers';
import { CommonModule } from '@angular/common';
import ThemeService from '../../themes/theme-service';
import Chonse2 from '../../../libs/chonse2-lib/chonse2';
import LocalStorageHelper from '../../../libs/local-storage-helper';
import Sound from '../chessboard/sound';
import { Chessboard } from '../chessboard/chessboard';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CoachMiscHelpers } from '../../../libs/coach-lib/coach-misc-helpers';
import { CoachMoveFlagType, CoachMoveSequenceType, CoachIdeaFlagType, CoachIdea, CoachResourceFlagType } from '../../../libs/coach-lib/coach-types';
import { CoachAudio } from '../../../libs/coach-lib/coach-audio';

@Component({
  selector: 'app-coach-display',
  imports: [IconButton, CommonModule, TranslatePipe],
  templateUrl: './coach-display.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './coach-display.css',
})
export class CoachDisplay {
  protected readonly MoveClassification = MoveClassification;
  ChessboardHelper = ChessboardHelper;
  LocalStorageHelper = LocalStorageHelper;
  moveClassificationLabels = moveClassificationLabels;

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

  private translate = inject(TranslateService);

  constructor(public themeService: ThemeService, public coachAudio: CoachAudio)
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
      return this.translate.instant('chessboard.coachDisplay.followUpButton.showCheckmate');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.LeftPieceHanging))
    {
      return this.translate.instant('chessboard.coachDisplay.followUpButton.showHangingPiece');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.CausedMaterialLoss))
    {
      return this.translate.instant('chessboard.coachDisplay.followUpButton.showMaterialLoss');
    }    

    return this.translate.instant('chessboard.coachDisplay.followUpButton.showFollowUp');
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
    //Changes every single one of the coach moves to remove the delimiter (and thus they become regular moves)
    this.boardState().divergenceMoveStack.update(stack =>
      stack.map(mv => Object.assign(new MoveResult(), mv, { isCoachMove: false }))
    );

    this.boardState().isLocked.set(false);
    this.boardState().isCoachMoveShowing.set(false);
    this.boardState().isCoachMoveFinished.set(false);
    this.boardState().coachMoveSequenceType.set(CoachMoveSequenceType.None);
  }

  async doCoachMoveSequence(isMissedOpportunity: boolean = false)
  {
    this.boardState().isLocked.set(true);
    this.boardState().isCoachMoveFinished.set(false);

    //Lets the person see that this is a rollback without it confusing them
    if (isMissedOpportunity)
    {
      await this.delay(1000);
    }

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
            //Addresses possibility of a game ending by repetition or insufficient material but the engine not detecting it.
            if (this.boardState().getCurrentState().getGameState().isGameOver)
            {
              break;
            }

            //Retrieves the top engine move.
            const engineMove = topEngineLine.pv[i];

            //Clones the board so that the move can be played.
            const stateCopy = this.boardState().getCurrentState().getFullDeepCopy();

            //Converts the move.
            const {fromSquare, toSquare, promotion } = CoachMiscHelpers.convertUciToChonse2Move(engineMove);

            const currentState = this.boardState().getCurrentState();
            const rawPieceIndex = Chonse2.findIndexFromCoordinate(fromSquare);
            const piece = currentState.getPieceState()[rawPieceIndex.rowIndex][rawPieceIndex.colIndex];

            
            if (LocalStorageHelper.getBoolean(LocalStorageHelper.PIECE_ANIMATIONS, true))
            {
              //First, do the animation
              this.animateMove.emit({
                from: fromSquare,
                to: toSquare,
                piece
              });
              await this.delay(Chessboard.ANIMATION_DURATION_MS);
            }

            //Then play the move.
            const moveResult = MoveResult.createMoveResultFromInterface(stateCopy.completeMove(fromSquare, toSquare, promotion));
            moveResult.isCoachMove = true;
            moveResult.coachSentences.push({text: this.translate.instant('chessboard.coachDisplay.comments.topMove'), audioPath: CoachAudio.SKIP});

            //Then add it.
            this.boardState().pushState(stateCopy, moveResult, true);

            //If it's the first move in a missed opportunity, play the blip sound.
            if (isMissedOpportunity && i == 0)
            {
              Sound.playSound(Sound.BLIP);
              await this.delay(1000);
            }
            else 
            {
              Sound.playSoundForMove(moveResult.notation);
            }

            
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
    this.boardState().isCoachMoveFinished.set(false);
    this.boardState().disableCoachButtonsTemporarily();

    //Stops someone from moving a piece manually.
    this.boardState().isLocked.set(false);

    //Gets the most recent move and stores it.
    let mostRecentMove = this.boardState().getMostRecentMove();
    
    //Pops every single thing that is a coach-played move.
    while(mostRecentMove.isCoachMove)
    {
      this.boardState().goBack();
      mostRecentMove = this.boardState().getMostRecentMove();
    }

    //Sets flag so that the board can be used again.
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
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedCheckmate');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedFork))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedFork');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedHangingPiece))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedCapture');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.CapturedPieceWithWrongAttacker) || 
        move.coachMoveFlags.includes(CoachMoveFlagType.WrongDevelopment) ||
        move.coachMoveFlags.includes(CoachMoveFlagType.WrongPawnChainAttack) ||
        move.coachMoveFlags.includes(CoachMoveFlagType.WrongHangingPieceMove) ||
        move.coachMoveFlags.includes(CoachMoveFlagType.WrongHangingPieceDefence) ||
        move.coachMoveFlags.includes(CoachMoveFlagType.WrongDiscoveredCheck)
    )
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showAlternative');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedPin))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedPin');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedSkewer))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedSkewer');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedCastle))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedCastle');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedDevelopment))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedDevelopment');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedForcedPawnDoubling))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedDoubling');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedDoubleCheck))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedDoubleCheck');
    }

    if (move.coachMoveFlags.includes(CoachMoveFlagType.MissedDiscoveredCheck))
    {
      return this.translate.instant('chessboard.coachDisplay.missButton.showMissedDiscoveredCheck');
    }

    return this.translate.instant('chessboard.coachDisplay.missButton.showMiss');
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
    dummyResult.notation = "-";
    dummyResult.isCoachMove = true;

    //If they exist, push to divergence stack temporarily (creating a fake rollback)
    if (previousEval && previousState)
    {
      this.boardState().divergenceStateStack.update( s => [...s, previousState] );
      this.boardState().divergenceMoveStack.update( s=> [...s, dummyResult] );
      this.boardState().divergenceEvalStack.update( s => [...s, previousEval] )

      this.doCoachMoveSequence(true);
    }
  }

  //#endregion

  //#region ideas
  getIdeaButtonText(flag: CoachIdeaFlagType)
  {
    if (flag == CoachIdeaFlagType.ForkIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.fork');
    }

    if (flag == CoachIdeaFlagType.PinIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.pinnedPiece');
    }

    if (flag == CoachIdeaFlagType.CentralControlIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.centerPressure');
    }

    if (flag == CoachIdeaFlagType.DevelopmentIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.development');
    }

    if (flag == CoachIdeaFlagType.FianchettoIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.fianchetto');
    }

    if (flag == CoachIdeaFlagType.SkewerIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.skewer')
    }
    
    if (flag == CoachIdeaFlagType.PassedPawnIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.passedPawn');
    }

    if (flag == CoachIdeaFlagType.IsolatedPawnIdea)
    {
      return this.translate.instant('chessboard.coachDisplay.ideaButton.isolatedPawn');
    }

    return this.translate.instant('chessboard.coachDisplay.ideaButton.base');
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
      return this.translate.instant('chessboard.coachDisplay.resourceButton.openingLearnMore');
    }

    if (flag == CoachResourceFlagType.Skewer)
    {
      return this.translate.instant('chessboard.coachDisplay.resourceButton.skewerLearnMore');
    }

    if (flag == CoachResourceFlagType.Pin)
    {
      return this.translate.instant('chessboard.coachDisplay.resourceButton.pinLearnMore');
    }

    if (flag == CoachResourceFlagType.Outpost)
    {
      return this.translate.instant('chessboard.coachDisplay.resourceButton.outpostLearnMore');
    }

    return this.translate.instant('chessboard.coachDisplay.resourceButton.unknownResource');
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

  //#region Settings 
  handleAudioClicked()
  {
    const audioEnabled = LocalStorageHelper.getBoolean(LocalStorageHelper.INSIGHTS_AUDIO, true);

    if (audioEnabled)
    {
      this.coachAudio.stop();
    }
  
    LocalStorageHelper.setBoolean(LocalStorageHelper.INSIGHTS_AUDIO, !audioEnabled);
  }
  //#endregion
}

export const moveClassificationLabels: Record<MoveClassification, string> = {
  [MoveClassification.None] : "chessboard.coachDisplay.moveClassifications.none",
  [MoveClassification.Opening]: "chessboard.coachDisplay.moveClassifications.opening",
  [MoveClassification.Forced]: "chessboard.coachDisplay.moveClassifications.forced",
  [MoveClassification.Luminous]: "chessboard.coachDisplay.moveClassifications.luminous",
  [MoveClassification.Perfect]: "chessboard.coachDisplay.moveClassifications.perfect",
  [MoveClassification.Best]: "chessboard.coachDisplay.moveClassifications.best",
  [MoveClassification.Excellent]: "chessboard.coachDisplay.moveClassifications.excellent",
  [MoveClassification.Okay]: "chessboard.coachDisplay.moveClassifications.okay",
  [MoveClassification.Inaccuracy]: "chessboard.coachDisplay.moveClassifications.inaccuracy",
  [MoveClassification.Mistake]: "chessboard.coachDisplay.moveClassifications.mistake",
  [MoveClassification.Miss]: "chessboard.coachDisplay.moveClassifications.miss",
  [MoveClassification.Blunder]: "chessboard.coachDisplay.moveClassifications.blunder",
};
