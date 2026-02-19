import { Component, Input, OnInit } from '@angular/core';
import { ChartItemData } from './chart-item-data';
import { PositionEval } from '../engine/types/eval';
import { MoveClassification } from '../engine/types/enums';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';

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
      legend: { display: false },
      tooltip: 
      {
        callbacks: 
        {
          label: (tooltipItem) => 
          {
            //tooltipItem.datasetIndex and tooltipItem.dataIndex give you the index
            const dataset = tooltipItem.dataset;
            const dataIndex = tooltipItem.dataIndex!;
            
            //Access chart data
            const chartData = dataset.data as number[];
            const value = chartData[dataIndex];
            
            //Access custom properties
            const chartItem = this.getChartData().datasets[0].data[dataIndex] as any;

            // Build tooltip text
            const cp = chartItem.cp ?? '';
            const mate = chartItem.mate ?? '';
            const moveClass = chartItem.moveClassification ?? '';
            const y = chartItem.y;
            const val = mate ? ("M"+mate) : (cp / 100).toFixed(1);

            return `${val} Move: ${moveClass}`;
          }
        }
      }
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
    layout: 
    {
      padding: 0
    },
  };

  constructor()
  {

  }

  ngOnInit(): void 
  {
    //console.log(this.arr);
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
          data: chartItems.map( i => ({ y: i.value, x: i.moveNb, cp: i.cp, mate: i.mate, moveClassification: i.moveClassification })),
          fill: true,
          backgroundColor: "white",
          pointRadius: 0,
          pointHoverRadius: 1,
          pointHitRadius: 20,
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
