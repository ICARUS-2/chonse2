import { Component, computed, input, ChangeDetectionStrategy, inject } from '@angular/core';
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
  themeService = inject(ThemeService);


  boardState = input.required<BoardState>();
  whiteClock = input<string>("");
  blackClock = input<string>("");
  nameLength = input<number>(5);

  Math = Math;

  constructor()
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
