import { Component, computed, input } from '@angular/core';
import BoardState from '../chessboard/board-state';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-compact-board-player-info',
  imports: [],
  templateUrl: './compact-board-player-info.html',
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
