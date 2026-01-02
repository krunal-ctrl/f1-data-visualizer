import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-area-chart',
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './area-chart.html',
  styleUrl: './area-chart.scss',
})
export class AreaChart {
  @Input() data: any[] = [];
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  @Input() showLegend: boolean = true;
  @Input() height: number = 300;
  @Input() tooltipTemplate?: TemplateRef<any>;

  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  timeline = true;
  autoScale = true;

  // tooltip
  @Input() tooltipTemplateRef?: TemplateRef<any>;
  
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#00f0ff', '#dc0000', '#ff8700', '#0090ff', '#00d2be']
  };
}
