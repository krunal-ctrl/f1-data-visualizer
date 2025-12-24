import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SeasonService {
  selectedSeason = signal(this.getCurrentSeason());

  private getCurrentSeason(): string {
    return new Date().getFullYear().toString();
  }

  setSeason(season: string): void {
    this.selectedSeason.set(season);
  }
}