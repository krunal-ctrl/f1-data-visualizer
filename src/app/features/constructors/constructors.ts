import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { BarChart } from '../../shared/components/bar-chart/bar-chart';
import { SeasonService } from '../../core/services/season.service';
import { getTeamPrimaryColor } from '../../shared/utils/team-colors.util';
import { ConstructorStanding } from '../../core/models/team.model';
import { Store } from '@ngrx/store';
import { F1Actions } from '../../core/store/f1.actions';
import { selectConstructorStandings, selectF1Loading } from '../../core/store/f1.selectors';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';

@Component({
  selector: 'app-constructors',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Card,
    Loading,
    BarChart,
  ],
  templateUrl: './constructors.html',
  styleUrl: './constructors.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Constructors {
  private store = inject(Store);
  private seasonService = inject(SeasonService);

  constructorStandings = toSignal(
    toObservable(this.seasonService.selectedSeason).pipe(
      switchMap(season => this.store.select(selectConstructorStandings(season))),
      map(data => data || [])
    ),
    { initialValue: [] }
  );

  loading = toSignal(this.store.select(selectF1Loading), { initialValue: false });
  searchTerm = signal('');

  constructor() {
    effect(() => {
      this.store.dispatch(F1Actions.loadConstructorStandings({ 
        season: this.seasonService.selectedSeason() 
      }));
    });
  }

  filteredTeams = computed(() => {
    let teams = this.constructorStandings();

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      teams = teams.filter((team: ConstructorStanding) =>
        team.constructor.name.toLowerCase().includes(term) ||
        team.constructor.constructorId.toLowerCase().includes(term)
      );
    }

    return teams;
  })

  pointsChartData(): any {
    return this.filteredTeams().map((team: ConstructorStanding) => ({
      name: team.constructor.name,
      value: team.points
    }));
  }

  winsChartData(): any {
    return this.filteredTeams().map((team: ConstructorStanding) => ({
      name: team.constructor.name,
      value: team.wins
    }));
  }

  getTeamColor(constructorId: string): string {
    return getTeamPrimaryColor(constructorId);
  }
}
