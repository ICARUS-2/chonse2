import { Component, computed, input, output } from '@angular/core';
import { EngineInformation, EngineType, MoveClassification, moveClassificationLabels } from '../../../libs/engine-lib/types/enums';
import { IconButton } from '../../ui/icon-button/icon-button';
import BoardState from '../chessboard/board-state';
import MoveResult from '../chessboard/move-result';
import { CoachIdea, CoachIdeaFlagType, CoachMoveFlagType, CoachResourceFlagType } from '../../../libs/coach-lib/coach-utils';
import { EvalSource, PositionEval } from '../../../libs/engine-lib/types/eval';
import { ArrowContext } from '../chessboard/arrow';
import ChessboardHelper from '../helpers';
import { CommonModule } from '@angular/common';
import ThemeService from '../../themes/theme-service';
import Chonse2 from '../../../libs/chonse2-lib/chonse2';

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
