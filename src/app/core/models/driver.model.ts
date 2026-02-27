import { Constructor } from "./team.model";

export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  url?: string;
  image?: string; // Added for UI
}

export interface DriverStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  driver: Driver;
  constructors: Constructor[];
}