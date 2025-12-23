import { Driver } from "./driver.model";
import { Constructor } from "./team.model";

export interface Race {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: Circuit;
  url?: string;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: Location;
  url?: string;
}

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis: string;
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
    AverageSpeed: {
      units: string;
      speed: string;
    };
  };
}