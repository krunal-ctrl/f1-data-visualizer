import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { BaseChartComponent, Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-pie-chart',
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './pie-chart.html',
  styleUrl: './pie-chart.scss',
})
export class PieChart {
  @Input() data: any[] = [];
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  @Input() showLegend: boolean = false;
  @Input() height: number = 300;
  @Input() customColors: any[] = [];
  @Input() showLabels = true;
  @Input() legendTitle: string = '';

  @ContentChild(BaseChartComponent) chart!: BaseChartComponent;

  gradient = false;
  isDoughnut = false;
  private ro!: ResizeObserver;
  @ViewChild('host', { static: true }) host!: ElementRef;

  // tooltip
  @Input() tooltipTemplateRef?: TemplateRef<any>;

  ngAfterViewInit() {
    setTimeout(() => this.chart.update(), 0);
  }

  // ngOnDestroy() {
  //   this.ro.disconnect();
  // }

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#00f0ff', '#dc0000', '#ff8700', '#0090ff', '#00d2be']
  };
}
