import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { F1ApiService } from '../services/f1-api.service';
import { F1Actions } from './f1.actions';
import { catchError, map, of, switchMap, withLatestFrom, filter } from 'rxjs';
import { selectF1State } from './f1.selectors';

@Injectable()
export class F1Effects {
  private actions$ = inject(Actions);
  private f1ApiService = inject(F1ApiService);
  private store = inject(Store);

  loadDriverStandings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F1Actions.loadDriverStandings),
      withLatestFrom(this.store.select(selectF1State)),
      filter(([{ season }, state]) => !state.driverStandings[season]),
      switchMap(([{ season }]) =>
        this.f1ApiService.getDriverStandings(season).pipe(
          map(standings => F1Actions.loadDriverStandingsSuccess({ season, standings })),
          catchError(error => of(F1Actions.loadDriverStandingsFailure({ error: error.message })))
        )
      )
    )
  );

  loadConstructorStandings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F1Actions.loadConstructorStandings),
      withLatestFrom(this.store.select(selectF1State)),
      filter(([{ season }, state]) => !state.constructorStandings[season]),
      switchMap(([{ season }]) =>
        this.f1ApiService.getConstructorStandings(season).pipe(
          map(standings => F1Actions.loadConstructorStandingsSuccess({ season, standings })),
          catchError(error => of(F1Actions.loadConstructorStandingsFailure({ error: error.message })))
        )
      )
    )
  );

  loadRaceCalendar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F1Actions.loadRaceCalendar),
      withLatestFrom(this.store.select(selectF1State)),
      filter(([{ season }, state]) => !state.raceCalendar[season]),
      switchMap(([{ season }]) =>
        this.f1ApiService.getRaceCalendar(season).pipe(
          map(races => F1Actions.loadRaceCalendarSuccess({ season, races })),
          catchError(error => of(F1Actions.loadRaceCalendarFailure({ error: error.message })))
        )
      )
    )
  );
}
