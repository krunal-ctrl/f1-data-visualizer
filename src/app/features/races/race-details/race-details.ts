import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Card } from '../../../shared/components/card/card';
import { Loading } from '../../../shared/components/loading/loading';
import { F1ApiService } from '../../../core/services/f1-api.service';
import { WeatherService } from '../../../core/services/weather.service';
import { forkJoin, finalize, of, switchMap, Observable, tap } from 'rxjs';
import { getTeamPrimaryColor } from '../../../shared/utils/team-colors.util';
import { getCountryCode } from '../../../shared/utils/country-codes.util';
import { Race, RaceResult, QualifyingResult } from '../../../core/models/race.model';
import { WeatherData } from '../../../core/models/weather.model';
import { DriverStanding } from '../../../core/models/driver.model';
import { CircuitMap } from '../../../shared/components/circuit-map/circuit-map';

@Component({
  selector: 'app-race-details',
  imports: [
    CommonModule,
    RouterModule,
    Card,
    Loading,
    CircuitMap
  ],
  templateUrl: './race-details.html',
  styleUrl: './race-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RaceDetails implements OnInit {
  private apiService = inject(F1ApiService);
  private weatherService = inject(WeatherService);
  private route = inject(ActivatedRoute);

  season = signal<string>('');
  round = signal<string>('');
  raceDetails = signal<Race | null>(null);
  qualifyingResults = signal<QualifyingResult[]>([]);
  weather = signal<WeatherData | null>(null);
  sessionWeather = signal<{ [key: string]: WeatherData | null }>({});
  championshipLeader = signal<DriverStanding | null>(null);
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
      raceInfo: this.apiService.getRaceDetails(this.season(), this.round()),
      raceResults: this.apiService.getRaceResultDetails(this.season(), this.round()),
      qualifyingData: this.apiService.getQualifyingDetails(this.season(), this.round()),
      standings: this.apiService.getDriverStandings(this.season())
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ raceInfo, raceResults, qualifyingData, standings }) => {
          // Merge results into raceInfo if they exist
          const mergedDetails = raceInfo ? {
            ...raceInfo,
            results: raceResults?.results || raceInfo.results
          } : raceResults;

          this.raceDetails.set(mergedDetails);
          this.qualifyingResults.set(qualifyingData);
          this.championshipLeader.set(standings[0] || null);
          
          if (mergedDetails?.circuit?.location) {
            this.buildWeatherRequests(mergedDetails);
          }
        },
        error: err => {
          console.error('Error loading race details:', err);
        }
      });
  }

  private buildWeatherRequests(raceData: any): void {
    if (!raceData?.circuit?.location) return;

    const sessions: { [key: string]: any } = {
      'FP1': raceData.firstPractice,
      'FP2': raceData.secondPractice,
      'FP3': raceData.thirdPractice,
      'Qualifying': raceData.qualifying,
      'Sprint': raceData.sprint,
      'Race': { date: raceData.date, time: raceData.time }
    };

    // Filter out sessions with no date
    const validSessions = Object.fromEntries(
      Object.entries(sessions).filter(([, s]) => s?.date)
    );

    this.weatherService.getWeatherForSessions(
      raceData.circuit.location.lat,
      raceData.circuit.location.long,
      validSessions,
    ).subscribe({
      next: sessionWeather => this.sessionWeather.set(sessionWeather),
      error: err => console.error('Error fetching session weather:', err)
    });
  }

  getTeamColor(constructorId: string): string {
    return getTeamPrimaryColor(constructorId);
  }

  getFlagUrl(country: string): string {
    const code = getCountryCode(country);
    if (!code) return '';
    return `https://flagcdn.com/w40/${code}.png`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
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
