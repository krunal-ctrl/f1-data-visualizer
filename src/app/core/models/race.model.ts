import { Driver } from "./driver.model";
import { Constructor } from "./team.model";

export interface Session {
  date: string;
  time?: string;
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  circuit: Circuit;
  results?: RaceResult[];
  qualifyingResults?: QualifyingResult[];
  firstPractice?: Session;
  secondPractice?: Session;
  thirdPractice?: Session;
  qualifying?: Session;
  sprint?: Session;
  url?: string;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  location: Location;
  url?: string;
}

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface RaceResult {
  number: number;
  position: number;
  positionText: string;
  points: number;
  driver: Driver;
  constructor: Constructor;
  grid: number;
  laps: number;
  status: string;
  time?: {
    millis: string;
    time: string;
  };
  fastestLap?: {
    rank: number;
    lap: number;
    time: {
      time: string;
    };
    // averageSpeed: {
    //   units: string;
    //   speed: string;
    // };
  };
}

export interface QualifyingResult {
  number: number;
  position: number;
  driver: Driver;
  constructor: Constructor;
  q1?: string;
  q2?: string;
  q3?: string;
}