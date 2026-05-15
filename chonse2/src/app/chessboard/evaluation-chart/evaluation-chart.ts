import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartItemData } from './chart-item-data';
import { BaseChartDirective } from 'ng2-charts';
import { ActiveElement, Chart, ChartConfiguration, ChartEvent } from 'chart.js';
import ThemeService from '../../themes/theme-service';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import { PositionEval } from '../../../libs/engine-lib/types/eval';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluation-chart',
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './evaluation-chart.html',
  styleUrl: './evaluation-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationChart implements OnInit {

  @Input() arr: PositionEval[] = [];
  @Input() selectedIndex = 0;
  @Output() pointClicked: EventEmitter<number> = new EventEmitter<number>();

  verticalLinePlugin = 
  {
    id: 'verticalLinePlugin',
    afterDraw: (chart: any) => {
      if (this.selectedIndex === null) return;

      const ctx = chart.ctx;
      const xScale = chart.scales.x;

      const x = xScale.getPixelForValue(this.selectedIndex);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, chart.chartArea.top);
      ctx.lineTo(x, chart.chartArea.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.getVerticalLineColor();
      ctx.stroke();
      ctx.restore();
    }
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: 
    {
      legend: { display: false },
      tooltip: 
      {
        displayColors: false,
        callbacks: 
        {
          title: () => {},
          label: (tooltipItem) => 
          {
            //tooltipItem.datasetIndex and tooltipItem.dataIndex give the index
            const dataset = tooltipItem.dataset;
            const dataIndex = tooltipItem.dataIndex!;
            
            //Access chart data
            const chartData = dataset.data as number[];
            const value = chartData[dataIndex];
            
            //Access custom properties
            const chartItem = this.getChartData().datasets[0].data[dataIndex] as any;

            //Build tooltip text
            const cp = chartItem.cp ?? '';
            const mate = chartItem.mate ?? '';
            const moveClass = chartItem.moveClassification ?? '';
            const y = chartItem.y;
            const val = mate ? ("M"+mate) : (cp / 100).toFixed(1);

            return `${val} - ${moveClass}`;
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

    onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) =>
    {
      if (!elements)
      {
        return;
      }

      const firstElement = elements[0];

      if (!firstElement)
      {
        return;
      }

      const idx = firstElement.index;
      
      this.pointClicked.emit(idx);
    }
  };

  constructor(public themeService: ThemeService)
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
          data: chartItems.map(i => ({
            y: i.value,
            x: i.moveNb,
            cp: i.cp,
            mate: i.mate,
            moveClassification: i.moveClassification
          })),
          fill: true,
          backgroundColor: "white",
          pointHoverRadius: 6,

          pointRadius: (ctx) => {
            const p = ctx.raw as any;
            return p.moveClassification ? 6 : 0;
          },

          pointBackgroundColor: (ctx) => 
          {
            const p = ctx.raw as any;

            return this.getPointColor(p);
          },

          pointBorderWidth: 0,
        }
      ]
    }

    return lineChartData;
  }

  private getPointColor(p: any)
  {
    switch (p.moveClassification) 
    {
      case MoveClassification.Blunder: 
        return 'red';
      case MoveClassification.Mistake: 
        return 'orange';
      case MoveClassification.Best: 
        return 'lime';
      case MoveClassification.Perfect: 
        return 'purple';
      case MoveClassification.Luminous: 
        return 'cyan';
      default: 
        return 'transparent';
    }
  }

  private getVerticalLineColor()
  {
    if (!this.arr[this.selectedIndex])
    {
      return "transparent";
    }
    
    switch (this.arr[this.selectedIndex].moveClassification) 
    {
      case MoveClassification.Miss:
        return "indianred";
      case MoveClassification.Blunder: 
        return 'red';
      case MoveClassification.Mistake: 
        return 'orange';
      case MoveClassification.Best: 
        return 'lime';
      case MoveClassification.Excellent:
        return 'lime';
      case MoveClassification.Okay:
        return 'yellowgreen';
      case MoveClassification.Inaccuracy:
        return 'yellow'
      case MoveClassification.Perfect: 
        return 'purple';
      case MoveClassification.Luminous: 
        return 'aquamarine';
      case MoveClassification.Forced:
        return 'gray';
      case MoveClassification.Opening:
        return 'lightgray';
      default: 
        return 'transparent';
    }
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
