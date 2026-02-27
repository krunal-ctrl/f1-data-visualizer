export interface ErgastResponse<T> {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    StandingsTable?: {
      season: string;
      StandingsLists: T[];
    };
    RaceTable?: {
      season?: string;
      round?: string;
      Races: T[];
    };
    DriverTable?: {
      driverId?: string;
      Drivers: T[];
    };
    ConstructorTable?: {
      constructorId?: string;
      Constructors: T[];
    };
    CircuitTable?: {
      circuitId?: string;
      Circuits: T[];
    };
  };
}
