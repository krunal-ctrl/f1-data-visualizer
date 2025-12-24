import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() icon!: string;
  @Input() subtitle?: string;
  @Input() trend?: 'up' | 'down';
}
