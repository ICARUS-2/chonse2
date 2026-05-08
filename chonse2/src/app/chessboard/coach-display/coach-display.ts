import { Component, computed, input, output } from '@angular/core';
import { EngineInformation, EngineType, MoveClassification, moveClassificationLabels } from '../../../libs/engine-lib/types/enums';
import { IconButton } from '../../ui/icon-button/icon-button';
import BoardState from '../chessboard/board-state';
import MoveResult from '../chessboard/move-result';
import { CoachIdeaFlagType, CoachMoveFlagType } from '../../../libs/coach-lib/coach-utils';
import { EvalSource, PositionEval } from '../../../libs/engine-lib/types/eval';
import { Arrow, ArrowContext } from '../chessboard/arrow';
import ChessboardHelper from '../helpers';
import { CommonModule } from '@angular/common';

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
  coachButtonsDisabled = input.required<boolean>();

  // --- Action Inputs (Callbacks) ---
  showFollowUpClicked = output<void>();
  showMissedOpportunityClicked = output<void>();
  hideSequence = output<void>();

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

    return "Show miss";
  }

  getIdeaButtonText(flag: CoachIdeaFlagType)
  {
    const BASE = "Show Idea: ";

    if (flag == CoachIdeaFlagType.ForkIdea)
    {
      return BASE + "Fork";
    }

    return BASE;
  }

  showIdeaButtonClicked(arrows: Array<Arrow> | undefined)
  {
    if (!arrows)
    {
      return;
    }

    this.boardState().isLocked.set(true);
    this.boardState().isCoachIdeaShowing.set(true);
    this.boardState().arrows.set([...this.boardState().arrows(), ...arrows] )
  }

  hideIdeaButtonClicked()
  {
    this.boardState().isCoachIdeaShowing.set(false);
    this.boardState().isLocked.set(false);
    this.boardState().arrows.set(this.boardState().arrows().filter( a => a.context != ArrowContext.Coach));
  }
}
