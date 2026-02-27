import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { F1ApiService } from '../../core/services/f1-api.service';
import { SeasonService } from '../../core/services/season.service';
import { forkJoin, finalize } from 'rxjs';
import { DriverStanding } from '../../core/models/driver.model';
import { ConstructorStanding } from '../../core/models/team.model';
import { Race } from '../../core/models/race.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    Card,
    Loading,
    StatCard
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {

  private apiService = inject(F1ApiService);
  private seasonService = inject(SeasonService);

  driverStandings = signal<DriverStanding[]>([]);
  constructorStandings = signal<ConstructorStanding[]>([]);
  raceCalendar = signal<Race[]>([]);
  loading = signal(true);
  nextRace = signal<Race | null>(null);

  constructor() {
    effect(() => {
      this.loadDashboardData(this.seasonService.selectedSeason());
    });
  }

  private loadDashboardData(season: string): void {
    this.loading.set(true);

    forkJoin({
      drivers: this.apiService.getDriverStandings(season),
      constructors: this.apiService.getConstructorStandings(season),
      races: this.apiService.getRaceCalendar(season)
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ drivers, constructors, races }) => {
          this.driverStandings.set(drivers);
          this.constructorStandings.set(constructors);
          this.raceCalendar.set(races);

          const now = new Date();
          const upcoming = races.find((race: Race) => new Date(race.date) > now);
          this.nextRace.set(upcoming || null);
        },
        error: error => {
          console.error('Error loading dashboard:', error);
        }
      });
  }

  getTopDrivers(count: number = 3): DriverStanding[] {
    return this.driverStandings().slice(0, count) || [];
  }

  getTopTeams(count: number = 3): ConstructorStanding[] {
    return this.constructorStandings().slice(0, count) || [];
  }

  getDaysUntilNextRace(): number {
    const next = this.nextRace();
    if (!next) return 0;
    const now = new Date();
    const raceDate = new Date(next.date);
    const diff = raceDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getCompletedRaces(): number {
    const now = new Date();
    return this.raceCalendar().filter((race: Race) => new Date(race.date) < now).length;
  }

  getTotalRaces(): number {
    return this.raceCalendar().length;
  }

  getCurrentRound(): number {
    return this.getCompletedRaces() + 1;
  }
}
