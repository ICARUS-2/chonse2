import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import ThemeService from '../../themes/theme-service';
import { CommonModule } from '@angular/common';
import { CompactBoardPlayerInfoModal } from './compact-board-player-info-modal/compact-board-player-info-modal';

@Component({
  selector: 'app-compact-board-player-info',
  imports: [CommonModule, CompactBoardPlayerInfoModal],
  templateUrl: './compact-board-player-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './compact-board-player-info.css',
})
export class CompactBoardPlayerInfo {

  boardState = input.required<BoardState>();
  whiteClock = input<string>("");
  blackClock = input<string>("");
  nameLength = input<number>(5);

  Math = Math;

  constructor(public themeService: ThemeService)
  {
    
  }

  getShortenedName(name: string)
  {
    if (name.length <= this.nameLength())
    {
      return name;
    }

    return name.substring(0, this.nameLength()) + "..."
  }

  getAdvantage = computed( () =>
  {
    return this.boardState().getCurrentState().getMaterialAdvantage();
  } )
}
