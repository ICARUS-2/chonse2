import { Component, computed, input, signal, ChangeDetectionStrategy } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import { PositionEval } from '../../../libs/engine-lib/types/eval';
import MoveResult from '../chessboard/move-result';
import ChessboardHelper from '../helpers';

@Component({
  selector: 'tr[app-divergence-table-entry]',
  imports: [],
  templateUrl: './divergence-table-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './divergence-table-entry.css',
})
export class DivergenceTableEntry {

  MoveClassification = MoveClassification;

  moveStack = input<Array<MoveResult>>([]);
  evalStack = input<Array<PositionEval | undefined>>([]);
  
  constructor(public themeService: ThemeService)
  {

  }

  getIconSourceForMoveClassification = (classification: MoveClassification) => computed( () => 
  {
    ChessboardHelper.getIconSourceForMoveClassification(classification);
  })
}
