import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-line-chart',
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss',
})
export class LineChart {
  @Input() data: any[] = [];
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  @Input() showLegend: boolean = true;
  @Input() height: number = 300;
  @Input() customColors: any[] = [];

  // tooltip
  @Input() tooltipTemplateRef?: TemplateRef<any>;

  // chart options
  showXAxis: boolean = true;
  showYAxis: boolean = true
  gradient: boolean = false;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  timeline: boolean = true;
  autoScale: boolean = true;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#00f0ff', '#dc0000', '#ff8700', '#0090ff', '#00d2be']
  }
}
