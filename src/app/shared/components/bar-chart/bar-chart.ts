import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-bar-chart',
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss',
})
export class BarChart {
  @Input() data: any[] = [];
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  @Input() showLegend: boolean = false;
  @Input() height: number = 300;
  @Input() customColors: any[] = [];

  // tooltip
  @Input() tooltipTemplateRef?: TemplateRef<any>;

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showXAxisLabel = true;
  showYAxisLabel = true;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#00f0ff']
  }
}
