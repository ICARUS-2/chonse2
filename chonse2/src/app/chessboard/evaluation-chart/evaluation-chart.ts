import { Component, Input } from '@angular/core';
import { ChartItemData } from './chart-item-data';
import { PositionEval } from '../engine/types/eval';
import { MoveClassification } from '../engine/types/enums';

@Component({
  selector: 'app-evaluation-chart',
  imports: [],
  templateUrl: './evaluation-chart.html',
  styleUrl: './evaluation-chart.css',
})
export class EvaluationChart {

  @Input() arr: PositionEval[] = [];

  getChartData()
  {
    return this.arr.map(this._formatSingleEvalToChartData);
  }

  getBestDotIndeces()
  {
    const bestItems = this.getChartData().filter(
      (item) => item.moveClassification === MoveClassification.Best
    );
    const count = Math.ceil(bestItems.length * 0.15);
    const indices = bestItems.map((item) => item.moveNb);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return new Set(indices.slice(0, count));
  }

  private _formatSingleEvalToChartData = (
    position: PositionEval,
    index: number
  ): ChartItemData => {
    const line = position.lines[0];
  
    const chartItem: ChartItemData = {
      moveNb: index,
      value: 10,
      cp: line.cp,
      mate: line.mate,
      moveClassification: position.moveClassification,
    };
  
    if (line.mate) {
      return {
        ...chartItem,
        value: line.mate > 0 ? 20 : 0,
      };
    }
  
    if (line.cp) {
      return {
        ...chartItem,
        value: Math.max(Math.min(line.cp / 100, 10), -10) + 10,
      };
    }
  
    return chartItem;
  };
  
  
}
