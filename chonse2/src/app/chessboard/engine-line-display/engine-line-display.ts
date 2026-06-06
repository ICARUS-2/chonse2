import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { CommonModule } from '@angular/common';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-engine-line-display',
  imports: [CommonModule],
  templateUrl: './engine-line-display.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './engine-line-display.css',
})
export class EngineLineDisplay {
  boardState = input.required<BoardState>();
  getImageSourceForEnginePiece = input.required<(pv: string) => () => string | null>();

  protected readonly MoveClassification = MoveClassification;
  protected readonly Math = Math;

  constructor(public themeService: ThemeService)
  {

  }
}
