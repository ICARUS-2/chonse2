import { Component, inject, input } from '@angular/core';
import BoardState from '../chessboard/board-state';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-game-info',
  imports: [],
  templateUrl: './game-info.html',
  styleUrl: './game-info.css',
})
export class GameInfo {
  boardState = input.required<BoardState>();
  getOpeningDisplay = input.required<() => string>();

  themeService = inject(ThemeService);

  get statusText(): string {
    const headers = this.boardState().pgnHeaders();
    const state = this.boardState().getCurrentState().gameState;

    const prefix = headers.termination
      ? headers.termination !== 'Normal'
        ? headers.termination + ' - '
        : headers.result + ' - '
      : '- ';

    const suffix = state.isGameOver
      ? `${state.reason} ${state.gameScore}`
      : this.boardState().getCurrentState().turn
        ? 'White to move'
        : 'Black to move';

    return prefix + suffix;
  }
}
