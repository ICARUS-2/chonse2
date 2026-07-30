import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import { Chessboard } from '../chessboard/chessboard';
import { CommonModule } from '@angular/common';
import ChessboardHelper from '../helpers';
import { TranslatePipe } from '@ngx-translate/core';
import { PieceColor } from '../../../libs/chess-game-lib/types/piece-color';

@Component({
  selector: 'app-move-overview',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './move-overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './move-overview.css',
})
export class MoveOverview {
  
  ChessboardHelper = ChessboardHelper
  MoveClassificationDisplayName = MoveClassificationDisplayName;

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

  protected themeService = inject(ThemeService);
}

export const MoveClassificationDisplayName: Record<MoveClassification, string> = 
{
  [MoveClassification.Luminous]: "chessboard.moveOverview.moveClassificationDisplay.luminous",
  [MoveClassification.Perfect]: "chessboard.moveOverview.moveClassificationDisplay.perfect",
  [MoveClassification.Best]: "chessboard.moveOverview.moveClassificationDisplay.best",
  [MoveClassification.Excellent]: "chessboard.moveOverview.moveClassificationDisplay.excellent",
  [MoveClassification.Okay]: "chessboard.moveOverview.moveClassificationDisplay.okay",
  [MoveClassification.Inaccuracy]: "chessboard.moveOverview.moveClassificationDisplay.inaccuracy",
  [MoveClassification.Mistake]: "chessboard.moveOverview.moveClassificationDisplay.mistake",
  [MoveClassification.Blunder]: "chessboard.moveOverview.moveClassificationDisplay.blunder",
  [MoveClassification.Miss]: "chessboard.moveOverview.moveClassificationDisplay.miss",
  [MoveClassification.Opening]: "chessboard.moveOverview.moveClassificationDisplay.opening",
  [MoveClassification.Forced]: "chessboard.moveOverview.moveClassificationDisplay.forced",
  [MoveClassification.None]: "chessboard.moveOverview.moveClassificationDisplay.none"
};

