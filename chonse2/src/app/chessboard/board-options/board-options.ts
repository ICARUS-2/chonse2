import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { IconButton } from '../../ui/icon-button/icon-button';
import ThemeService from '../../themes/theme-service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-board-options',
  imports: [IconButton, CommonModule, TranslatePipe],
  templateUrl: './board-options.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './board-options.css',
})
export class BoardOptions {

  constructor(public themeService: ThemeService)
  {

  }
  

  boardState = input.required<BoardState>();
 
  importClicked = output<void>();
  resetClicked = output<void>();
  analyzeClicked = output<void>();
  exportGameClicked = output<void>();
  resignVsAiClicked = output<void>();
  beginGameVsAiClicked = output<void>();
  analyzeAiGameClicked = output<void>();
  saveToDbClicked = output<void>();
  
 
  get mostCurrentMainState() {
    const stack = this.boardState().mainStateStack();
    return stack[stack.length - 1];
  }
}
