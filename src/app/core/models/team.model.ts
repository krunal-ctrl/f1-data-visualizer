
export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}