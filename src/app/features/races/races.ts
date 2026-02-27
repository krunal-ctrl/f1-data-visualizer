import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { SeasonService } from '../../core/services/season.service';
import { Race } from '../../core/models/race.model';
import { Store } from '@ngrx/store';
import { F1Actions } from '../../core/store/f1.actions';
import { selectRaceCalendar, selectF1Loading } from '../../core/store/f1.selectors';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';
import { getCountryCode } from '../../shared/utils/country-codes.util';
import { CircuitMap } from '../../shared/components/circuit-map/circuit-map';

@Component({
  selector: 'app-races',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Card,
    Loading,
    CircuitMap
  ],
  templateUrl: './races.html',
  styleUrl: './races.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Races {
  private store = inject(Store);
  private seasonService = inject(SeasonService);

  raceCalendar = toSignal(
    toObservable(this.seasonService.selectedSeason).pipe(
      switchMap(season => this.store.select(selectRaceCalendar(season))),
      map(data => data || [])
    ),
    { initialValue: [] }
  );

  loading = toSignal(this.store.select(selectF1Loading), { initialValue: false });
  searchTerm = signal('');
  selectedFilter = signal('all');

  constructor() {
    effect(() => {
      this.store.dispatch(F1Actions.loadRaceCalendar({ 
        season: this.seasonService.selectedSeason() 
      }));
    });
  }

  filteredRaces = computed(() => {
    let races = this.raceCalendar();
    const now = new Date();

    // Filter by status
    if (this.selectedFilter() === 'completed') {
      races = races.filter(race => new Date(race.date) < now);
    } else if (this.selectedFilter() === 'upcoming') {
      races = races.filter(race => new Date(race.date) >= now);
    }

    // Filter by search
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      races = races.filter(race =>
        race.raceName.toLowerCase().includes(term) ||
        race.circuit.circuitName.toLowerCase().includes(term) ||
        race.circuit.location.country.toLowerCase().includes(term) ||
        race.circuit.location.locality.toLowerCase().includes(term)
      );
    }

    return races;
  });

  completedCount = computed(() => {
    const now = new Date();
    return this.raceCalendar().filter(race => new Date(race.date) < now).length;
  });

  upcomingCount = computed(() => {
    const now = new Date();
    return this.raceCalendar().filter(race => new Date(race.date) >= now).length;
  });

  nextRace = computed(() => {
    const now = new Date();
    return this.raceCalendar().find(race => new Date(race.date) >= now);
  });

  isRaceCompleted(raceDate: string): boolean {
    return new Date(raceDate) < new Date();
  }

  getDaysUntilRace(raceDate: string): number {
    const now = new Date();
    const race = new Date(raceDate);
    const diff = race.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getFlagUrl(country: string): string {
    const code = getCountryCode(country);
    if (!code) return '';
    return `https://flagcdn.com/w40/${code}.png`;
  }
}
