import { Component, Input, OnInit } from '@angular/core';
import { ChartItemData } from './chart-item-data';
import { PositionEval } from '../engine/types/eval';
import { MoveClassification } from '../engine/types/enums';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-evaluation-chart',
  imports: [BaseChartDirective],
  templateUrl: './evaluation-chart.html',
  styleUrl: './evaluation-chart.css',
})
export class EvaluationChart implements OnInit {

  @Input() arr: PositionEval[] = [];

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: 
    {
      legend: { display: false }
    },
    scales: 
    {
      x: 
      {
        type: 'category',
        display: false,
      },
      y: 
      {
        display: false,
        min: 0,
        max: 20
      },
    },
  };

  constructor()
  {

  }

  ngOnInit(): void 
  {
    
  }

  getChartData()
  {
    const chartItems = this.arr.map(this._formatSingleEvalToChartData);
    
    const lineChartData: ChartConfiguration<"line">['data'] = 
    {
      labels: chartItems.map(i => i.moveNb.toString()),
      datasets: 
      [
        {
          data: chartItems.map( i => i.value ),
          fill: true,
        }
      ],
    }

    return lineChartData;
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
