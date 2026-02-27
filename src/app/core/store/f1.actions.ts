import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DriverStanding } from '../models/driver.model';
import { ConstructorStanding } from '../models/team.model';
import { Race, Circuit } from '../models/race.model';

export const F1Actions = createActionGroup({
  source: 'F1 API',
  events: {
    'Load Driver Standings': props<{ season: string }>(),
    'Load Driver Standings Success': props<{ season: string; standings: DriverStanding[] }>(),
    'Load Driver Standings Failure': props<{ error: string }>(),

    'Load Constructor Standings': props<{ season: string }>(),
    'Load Constructor Standings Success': props<{ season: string; standings: ConstructorStanding[] }>(),
    'Load Constructor Standings Failure': props<{ error: string }>(),

    'Load Race Calendar': props<{ season: string }>(),
    'Load Race Calendar Success': props<{ season: string; races: Race[] }>(),
    'Load Race Calendar Failure': props<{ error: string }>(),

    'Load Circuits': props<{ season: string }>(),
    'Load Circuits Success': props<{ season: string; circuits: Circuit[] }>(),
    'Load Circuits Failure': props<{ error: string }>(),
  }
});
