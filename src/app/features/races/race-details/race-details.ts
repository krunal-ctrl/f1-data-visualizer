import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Card } from '../../../shared/components/card/card';
import { Loading } from '../../../shared/components/loading/loading';
import { F1ApiService } from '../../../core/services/f1-api.service';
import { forkJoin, finalize } from 'rxjs';
import { getTeamPrimaryColor } from '../../../shared/utils/team-colors.util';
import { Race, RaceResult, QualifyingResult } from '../../../core/models/race.model';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RaceDetails implements OnInit {
  private apiService = inject(F1ApiService);
  private route = inject(ActivatedRoute);

  season = signal<string>('');
  round = signal<string>('');
  raceDetails = signal<Race | null>(null);
  qualifyingResults = signal<QualifyingResult[]>([]);
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

  get fastestLapDriver(): RaceResult | null {
    const results = this.raceDetails()?.results;
    if (!results) return null;
    return results.find((r: RaceResult) => r.fastestLap?.rank === 1) || null;
  }

  get winner(): RaceResult | null {
    const results = this.raceDetails()?.results;
    if (!results) return null;
    return results[0];
  }

  get podium(): RaceResult[] {
    const results = this.raceDetails()?.results;
    if (!results) return [];
    return results.slice(0, 3);
  }

  get dnfCount(): number {
    const results = this.raceDetails()?.results;
    if (!results) return 0;
    return results.filter((r: RaceResult) =>
      r.status !== 'Finished' && !r.status.includes('+')
    ).length;
  }
}
