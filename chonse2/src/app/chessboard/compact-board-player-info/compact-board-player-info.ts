import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import ThemeService from '../../themes/theme-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compact-board-player-info',
  imports: [CommonModule],
  templateUrl: './compact-board-player-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './compact-board-player-info.css',
})
export class CompactBoardPlayerInfo {
  static readonly NAME_LENGTH = 5;

  boardState = input.required<BoardState>();

  Math = Math;

  constructor(public themeService: ThemeService)
  {
    
  }

  getShortenedName(name: string)
  {
    if (name.length <= CompactBoardPlayerInfo.NAME_LENGTH)
    {
      return name;
    }

    return name.substring(0, 7) + "..."
  }

  getAdvantage = computed( () =>
  {
    return this.boardState().getCurrentState().getMaterialAdvantage();
  } )
}
