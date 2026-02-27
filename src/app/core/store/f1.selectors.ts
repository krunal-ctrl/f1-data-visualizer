import { createFeatureSelector, createSelector } from '@ngrx/store';
import { F1State } from './f1.reducer';

export const selectF1State = createFeatureSelector<F1State>('f1');

export const selectDriverStandings = (season: string) => createSelector(
  selectF1State,
  (state) => state.driverStandings[season] || null
);

export const selectConstructorStandings = (season: string) => createSelector(
  selectF1State,
  (state) => state.constructorStandings[season] || null
);

export const selectRaceCalendar = (season: string) => createSelector(
  selectF1State,
  (state) => state.raceCalendar[season] || null
);

export const selectCircuits = (season: string) => createSelector(
  selectF1State,
  (state) => state.circuits[season] || null
);

export const selectF1Loading = createSelector(
  selectF1State,
  (state) => state.loading
);

export const selectF1Error = createSelector(
  selectF1State,
  (state) => state.error
);
