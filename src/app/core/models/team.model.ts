
export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
  color?: string; // Added for charts
}

export interface ConstructorStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  constructor: Constructor;
}