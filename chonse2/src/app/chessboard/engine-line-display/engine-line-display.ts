import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { CommonModule } from '@angular/common';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import ThemeService from '../../themes/theme-service';
import { LineEval, PositionEval } from '../../../libs/engine-lib/types/eval';
import { getLineWinPercentage, getPositionWinPercentage } from '../../../libs/engine-lib/helpers/winPercentage';
import { classifyByWinPctChange } from '../../../libs/engine-lib/helpers/moveClassification';
import ChessboardHelper from '../helpers';
import { uciMoveParams } from '../../../libs/engine-lib/helpers/chessHelper';
import { ArrowColors } from '../chessboard/arrow';

@Component({
  selector: 'app-engine-line-display',
  imports: [CommonModule],
  templateUrl: './engine-line-display.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './engine-line-display.css',
})
export class EngineLineDisplay {

  ChessboardHelper = ChessboardHelper;
  uciMoveParams = uciMoveParams;

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
    const isWhiteMove = this.boardState().getCurrentState().getTurn();

    const winPctChange = (lineWinPercentage - currentWinPercentage) * (isWhiteMove ? 1 : -1);

    return classifyByWinPctChange(winPctChange);
  }

  getUnderlineStyle(idx: number): string
  {
    switch(idx)
    {
      case 1:
        return ArrowColors.FUTURE_SECOND_BEST_MOVE;

      case 2:
        return ArrowColors.FUTURE_THIRD_BEST_MOVE;

      default:
        return ArrowColors.FUTURE_BEST_MOVE
    }
  }
}
