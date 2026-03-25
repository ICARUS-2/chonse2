import { Component, computed, input, signal } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import { PositionEval } from '../../../libs/engine-lib/types/eval';

@Component({
  selector: 'tr[app-divergence-table-entry]',
  imports: [],
  templateUrl: './divergence-table-entry.html',
  styleUrl: './divergence-table-entry.css',
})
export class DivergenceTableEntry {

  MoveClassification = MoveClassification;

  moveStack = input<Array<IMoveResult>>([]);
  evalStack = input<Array<PositionEval | undefined>>([]);
  
  constructor(public themeService: ThemeService)
  {

  }

  getIconSourceForMoveClassification = (classification: MoveClassification) => computed( () => 
  {
    return "icons/" + classification + ".png";
  })
}
