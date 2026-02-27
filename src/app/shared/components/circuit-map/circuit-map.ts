import { CommonModule } from '@angular/common';
import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-circuit-map',
  imports: [CommonModule],
  templateUrl: './circuit-map.html',
  styleUrl: './circuit-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircuitMap {
  @Input({ required: true }) circuitId!: string;
  @Input({ required: true }) circuitName!: string;
  @Input() height: string = 'aspect-video';

  failed = signal(false);

  private getNormalizedId(id: string): string {
    const normalizationMap: { [key: string]: string } = {
      'albert_park': 'Australia',
      'americas': 'USA',
      'bahrain': 'Bahrain',
      'bak': 'Azerbaijan',
      'catalunya': 'Spain',
      'hungaroring': 'Hungary',
      'interlagos': 'Brazil',
      'jeddah': 'Saudi_Arabia',
      'marina_bay': 'Singapore',
      'monaco': 'Monaco',
      'monza': 'Italy',
      'red_bull_ring': 'Austria',
      'rodriguez': 'Mexico_City',
      'silverstone': 'Great_Britain',
      'spa': 'Belgium',
      'suzuka': 'Japan',
      'yas_marina': 'Abu_Dhabi',
      'zandvoort': 'Netherlands',
      'vegas': 'Las_Vegas',
      'miami': 'Miami',
      'lusail': 'Qatar',
      'shanghai': 'China',
      'imola': 'Emilia_Romagna'
    };
    return normalizationMap[id] || id;
  }

  get imageUrl(): string {
    const normalizedId = this.getNormalizedId(this.circuitId);
    return `https://media.formula1.com/image/upload/f_auto,q_auto:best/fom-website/2023/Circuit%20Maps%2016x9/${normalizedId}_Circuit.png`;
  }

  handleError(event: any) {
    // const currentSrc = event.target.src;
    // const normalizedId = this.getNormalizedId(this.circuitId);

    // if (currentSrc.includes('2023/Circuit%20Maps%2016x9')) {
    //   event.target.src = `https://media.formula1.com/image/upload/f_auto,q_auto:best/fom-website/2024/Circuit%20Maps%2016x9/${normalizedId}_Circuit.png`;
    // } else if (currentSrc.includes('2024/Circuit%20Maps%2016x9')) {
    //   event.target.src = `https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/circuit-maps/16x9/${normalizedId}.png`;
    // } else {
    // }
    this.failed.set(true);
  }
}
