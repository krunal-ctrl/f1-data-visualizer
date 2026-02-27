import { createReducer, on } from '@ngrx/store';
import { F1Actions } from './f1.actions';
import { DriverStanding } from '../models/driver.model';
import { ConstructorStanding } from '../models/team.model';
import { Race, Circuit } from '../models/race.model';

export interface F1State {
  driverStandings: { [season: string]: DriverStanding[] };
  constructorStandings: { [season: string]: ConstructorStanding[] };
  raceCalendar: { [season: string]: Race[] };
  circuits: { [season: string]: Circuit[] };
  loading: boolean;
  error: string | null;
}

export const initialState: F1State = {
  driverStandings: {},
  constructorStandings: {},
  raceCalendar: {},
  circuits: {},
  loading: false,
  error: null,
};

export const f1Reducer = createReducer(
  initialState,
  on(F1Actions.loadDriverStandings, (state, { season }) => ({ 
    ...state, 
    loading: !state.driverStandings[season] 
  })),
  on(F1Actions.loadDriverStandingsSuccess, (state, { season, standings }) => ({
    ...state,
    loading: false,
    driverStandings: { ...state.driverStandings, [season]: standings }
  })),
  on(F1Actions.loadDriverStandingsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(F1Actions.loadConstructorStandings, (state, { season }) => ({ 
    ...state, 
    loading: !state.constructorStandings[season] 
  })),
  on(F1Actions.loadConstructorStandingsSuccess, (state, { season, standings }) => ({
    ...state,
    loading: false,
    constructorStandings: { ...state.constructorStandings, [season]: standings }
  })),
  on(F1Actions.loadConstructorStandingsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(F1Actions.loadRaceCalendar, (state, { season }) => ({ 
    ...state, 
    loading: !state.raceCalendar[season] 
  })),
  on(F1Actions.loadRaceCalendarSuccess, (state, { season, races }) => ({
    ...state,
    loading: false,
    raceCalendar: { ...state.raceCalendar, [season]: races }
  })),
  on(F1Actions.loadRaceCalendarFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(F1Actions.loadCircuits, (state, { season }) => ({ 
    ...state, 
    loading: !state.circuits[season] 
  })),
  on(F1Actions.loadCircuitsSuccess, (state, { season, circuits }) => ({
    ...state,
    loading: false,
    circuits: { ...state.circuits, [season]: circuits }
  })),
  on(F1Actions.loadCircuitsFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
