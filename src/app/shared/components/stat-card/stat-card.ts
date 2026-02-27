import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCard {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() icon!: string;
  @Input() subtitle?: string;
  @Input() trend?: 'up' | 'down';
}
