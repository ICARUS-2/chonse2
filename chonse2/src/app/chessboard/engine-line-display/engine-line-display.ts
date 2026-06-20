import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { CommonModule } from '@angular/common';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import ThemeService from '../../themes/theme-service';
import { LineEval, PositionEval } from '../../../libs/engine-lib/types/eval';
import { getLineWinPercentage, getPositionWinPercentage } from '../../../libs/engine-lib/helpers/winPercentage';
import { classifyByWinPctChange } from '../../../libs/engine-lib/helpers/moveClassification';
import ChessboardHelper from '../helpers';

@Component({
  selector: 'app-engine-line-display',
  imports: [CommonModule],
  templateUrl: './engine-line-display.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './engine-line-display.css',
})
export class EngineLineDisplay {

  ChessboardHelper = ChessboardHelper;

  boardState = input.required<BoardState>();
  getImageSourceForEnginePiece = input.required<(pv: string) => () => string | null>();

  protected readonly MoveClassification = MoveClassification;
  protected readonly Math = Math;

  constructor(public themeService: ThemeService)
  {

  }

  getMoveClassification(posEval: PositionEval, lineEval: LineEval): MoveClassification
  {
    if (posEval.lines[0] == lineEval)
    {
      return MoveClassification.Best;
    }
    const currentWinPercentage = getPositionWinPercentage(posEval);
    const lineWinPercentage = getLineWinPercentage(lineEval);
    const isWhiteMove = this.boardState().getCurrentState().turn;

    const winPctChange = (lineWinPercentage - currentWinPercentage) * (isWhiteMove ? 1 : -1);

    return classifyByWinPctChange(winPctChange);
  }
}
