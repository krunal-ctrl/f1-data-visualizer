import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Card } from '../../../shared/components/card/card';
import { Loading } from '../../../shared/components/loading/loading';
import { F1ApiService } from '../../../core/services/f1-api.service';
import { forkJoin, finalize } from 'rxjs';
import { getTeamPrimaryColor } from '../../../shared/utils/team-colors.util';

@Component({
  selector: 'app-race-details',
  imports: [
    CommonModule,
    RouterModule,
    Card,
    Loading
  ],
  templateUrl: './race-details.html',
  styleUrl: './race-details.scss',
})
export class RaceDetails {
  private apiService = inject(F1ApiService);
  private route = inject(ActivatedRoute);
  // private seasonService = inject(SeasonService);

  season = signal<string>('');
  round = signal<string>('');
  raceDetails = signal<any>(null);
  qualifyingResults = signal<any[]>([]);
  loading = signal(true);
  activeTab = signal<'results' | 'qualifying'>('results');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.season.set(params['season']);
      this.round.set(params['round']);
      this.loadRaceData();
    });
  }

  private loadRaceData(): void {
    this.loading.set(true);

    forkJoin({
      raceData: this.apiService.getRaceDetails(this.season(), this.round()),
      qualifyingData: this.apiService.getQualifyingDetails(this.season(), this.round())
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ raceData, qualifyingData }) => {
          this.raceDetails.set(raceData);
          this.qualifyingResults.set(qualifyingData);
        },
        error: err => {
          console.error('Error loading race data:', err);
        }
      });
  }

  getTeamColor(constructorId: string): string {
    return getTeamPrimaryColor(constructorId);
  }

  formatTime(time: string): string {
    if (!time) return '-';
    if (time.startsWith('+')) return time;
    return time;
  }

  get fastestLapDriver(): any {
    if (!this.raceDetails()?.Results) return null;
    return this.raceDetails().Results.find((r: any) => r.FastestLap?.rank === '1');
  }

  get winner(): any {
    if (!this.raceDetails()?.Results) return null;
    return this.raceDetails().Results[0];
  }

  get podium(): any[] {
    if (!this.raceDetails()?.Results) return [];
    return this.raceDetails().Results.slice(0, 3);
  }

  get dnfCount(): number {
    if (!this.raceDetails()?.Results) return 0;
    return this.raceDetails().Results.filter((r: any) =>
      r.status !== 'Finished' && !r.status.includes('+')
    ).length;
  }
}
