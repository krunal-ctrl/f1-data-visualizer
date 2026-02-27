import { Component, inject, Input, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-circuit-map-icon',
  imports: [],
  templateUrl: './circuit-map-icon.html',
  styleUrl: './circuit-map-icon.scss',
})
export class CircuitMapIcon {
  @Input({ required: true }) circuitId!: string;
  @Input({ required: true }) circuitName!: string;
  @Input() height: string = 'aspect-video';

  private themeService = inject(ThemeService);

  failed = signal(false);

  private getNormalizedId(id: string): string {
    const normalizationMap: { [key: string]: string } = {
      'albert_park': 'Australia',
      'americas': 'USA',
      'bahrain': 'Bahrain',
      'baku': 'Azerbaijan',
      'catalunya': 'Spain',
      'hungaroring': 'Hungary',
      'interlagos': 'Brazil',
      'jeddah': 'Saudi Arabia',
      'marina_bay': 'Singapore',
      'monaco': 'Monaco',
      'monza': 'Italy',
      'red_bull_ring': 'Austria',
      'rodriguez': 'Mexico',
      'silverstone': 'Great Britain',
      'spa': 'Belgium',
      'suzuka': 'Japan',
      'yas_marina': 'Abu Dhabi',
      'zandvoort': 'Netherlands',
      'vegas': 'Las Vegas',
      'miami': 'Miami',
      'losail': 'Qatar',
      'shanghai': 'China',
      'imola': 'Emilia Romagna',
      'villeneuve': 'Canada',
      'madring': 'Spain',
    };
    return normalizationMap[id] || id;
  }

  get imageUrl(): string {
    const normalizedId = this.getNormalizedId(this.circuitId);
    return `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1440/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/${normalizedId}${this.themeService.isDarkMode() ? '' : ' carbon'}.png`;
  }

  handleError(event: any) {
    this.failed.set(true);
  }
}
