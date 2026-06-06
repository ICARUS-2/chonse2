import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import { PieceColor } from '../../../libs/chonse2-lib/piece-color';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import { Chessboard } from '../chessboard/chessboard';
import { CommonModule } from '@angular/common';
import ChessboardHelper from '../helpers';

@Component({
  selector: 'app-move-overview',
  imports: [CommonModule],
  templateUrl: './move-overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './move-overview.css',
})
export class MoveOverview {
  
  ChessboardHelper = ChessboardHelper
  protected themeService = inject(ThemeService);

  // Inputs (Signals)
  boardState = input.required<any>(); // Replace 'any' with your BoardState type

  // Outputs
  moveClassificationClicked = output<{ color: PieceColor, classification: MoveClassification }>();

  // Expose Enums/Objects to Template
  protected readonly MoveClassification = MoveClassification;
  protected readonly PieceColor = PieceColor;
  protected readonly Chessboard = Chessboard;
  protected readonly Object = Object;

  protected onClassificationClick(color: PieceColor, classification: MoveClassification): void {
    this.moveClassificationClicked.emit({ color, classification });
  }
}
