import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import ThemeService from '../../themes/theme-service';
import { PositionEval } from '../../../libs/engine-lib/types/eval';
import { CommonModule } from '@angular/common';
import { FormatTermination } from '../chessboard/pgn-misc';

@Component({
  selector: 'app-game-info',
  imports: [CommonModule],
  templateUrl: './game-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './game-info.css',
})
export class GameInfo {
  boardState = input.required<BoardState>();

  themeService = inject(ThemeService);

  get statusText(): string {
    const headers = this.boardState().pgnHeaders();

    const prefix = FormatTermination(headers);
    return prefix;
  }

  get turn(): string
  {
      const state = this.boardState().getCurrentState().gameState;

      const turn = state.isGameOver
      ? `${state.reason} ${state.gameScore}`
      : this.boardState().getCurrentState().turn
        ? 'White to move'
        : 'Black to move';

      return turn;
  }

  getOpeningDisplay = computed( () : string => 
  {
    if (!this.boardState().eval)
    {
      return "-";
    }

    const recentEval: PositionEval | undefined = this.boardState().getMostRecentEval();

    if (!recentEval)
    {
      return "-";
    }
    else 
    {
      if (recentEval.opening)
      {
        return recentEval.opening;
      }
      else 
      {
        const evaluation = this.boardState().eval();
        if (evaluation?.positions)
        {
          const l = evaluation.positions.length - 1;
          return evaluation.positions[l].opening ?? "-";
        }
      }
    }
    return "-";
  } )
}
