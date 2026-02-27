import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { SeasonService } from '../../core/services/season.service';
import { Store } from '@ngrx/store';
import { F1Actions } from '../../core/store/f1.actions';
import { selectDriverStandings, selectConstructorStandings, selectRaceCalendar, selectF1Loading } from '../../core/store/f1.selectors';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { DriverStanding } from '../../core/models/driver.model';
import { ConstructorStanding } from '../../core/models/team.model';
import { Race } from '../../core/models/race.model';
import { switchMap, map } from 'rxjs';

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

  private store = inject(Store);
  private seasonService = inject(SeasonService);

  // Reactive streams that switch selectors based on the current season
  driverStandings = toSignal(
    toObservable(this.seasonService.selectedSeason).pipe(
      switchMap(season => this.store.select(selectDriverStandings(season))),
      map(data => data || [])
    ),
    { initialValue: [] }
  );
  
  constructorStandings = toSignal(
    toObservable(this.seasonService.selectedSeason).pipe(
      switchMap(season => this.store.select(selectConstructorStandings(season))),
      map(data => data || [])
    ),
    { initialValue: [] }
  );
  
  raceCalendar = toSignal(
    toObservable(this.seasonService.selectedSeason).pipe(
      switchMap(season => this.store.select(selectRaceCalendar(season))),
      map(data => data || [])
    ),
    { initialValue: [] }
  );

  loading = toSignal(this.store.select(selectF1Loading), { initialValue: false });

  nextRace = computed(() => {
    const races = this.raceCalendar();
    const now = new Date();
    return races.find((race: Race) => new Date(race.date) > now) || null;
  });

  constructor() {
    // Dispatch actions when season changes
    effect(() => {
      const season = this.seasonService.selectedSeason();
      this.store.dispatch(F1Actions.loadDriverStandings({ season }));
      this.store.dispatch(F1Actions.loadConstructorStandings({ season }));
      this.store.dispatch(F1Actions.loadRaceCalendar({ season }));
    });
  }

  getTopDrivers(count: number = 3): DriverStanding[] {
    return this.driverStandings().slice(0, count);
  }

  getTopTeams(count: number = 3): ConstructorStanding[] {
    return this.constructorStandings().slice(0, count);
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
