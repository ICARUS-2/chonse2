import { Component, input, output } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { IconButton } from '../../ui/icon-button/icon-button';

@Component({
  selector: 'app-board-options',
  imports: [IconButton],
  templateUrl: './board-options.html',
  styleUrl: './board-options.css',
})
export class BoardOptions {
  boardState = input.required<BoardState>();
 
  importClicked = output<void>();
  resetClicked = output<void>();
  analyzeClicked = output<void>();
  exportGameClicked = output<void>();
  resignVsAiClicked = output<void>();
  beginGameVsAiClicked = output<void>();
  analyzeAiGameClicked = output<void>();
 
  get mostCurrentMainState() {
    const stack = this.boardState().mainStateStack();
    return stack[stack.length - 1];
  }
}
