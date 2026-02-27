import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { SeasonService } from '../../core/services/season.service';
import { Store } from '@ngrx/store';
import { F1Actions } from '../../core/store/f1.actions';
import { selectRaceCalendar, selectF1Loading } from '../../core/store/f1.selectors';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';
import { getCountryCode } from '../../shared/utils/country-codes.util';
import { CircuitMapIcon } from '../../shared/components/circuit-map-icon/circuit-map-icon';

@Component({
  selector: 'app-circuits',
  imports: [CommonModule, FormsModule, RouterModule, Card, Loading, CircuitMapIcon],
  templateUrl: './circuits.html',
  styleUrl: './circuits.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Circuits {
  private store = inject(Store);
  private seasonService = inject(SeasonService);

  // Use Race Calendar as primary source to get dates/rounds
  races = toSignal(
    toObservable(this.seasonService.selectedSeason).pipe(
      switchMap(season => this.store.select(selectRaceCalendar(season))),
      map(data => data || [])
    ),
    { initialValue: [] }
  );

  loading = toSignal(this.store.select(selectF1Loading), { initialValue: false });
  searchTerm = signal('');

  constructor() {
    effect(() => {
      this.store.dispatch(F1Actions.loadRaceCalendar({ 
        season: this.seasonService.selectedSeason() 
      }));
    });
  }

  filteredRaces = computed(() => {
    const allRaces = this.races();
    const term = this.searchTerm().toLowerCase();

    if (!term) return allRaces;

    return allRaces.filter(r => 
      r.raceName.toLowerCase().includes(term) ||
      r.circuit.circuitName.toLowerCase().includes(term) ||
      r.circuit.location.locality.toLowerCase().includes(term) ||
      r.circuit.location.country.toLowerCase().includes(term)
    );
  });

  getGoogleMapsUrl(lat: string, long: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
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

  isUpcoming(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }
}
