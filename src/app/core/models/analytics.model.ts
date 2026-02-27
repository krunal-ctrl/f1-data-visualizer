import { Race } from "./race.model";

export interface PerformanceResult {
    round: number;
    raceName: string;
    position: number;
    points: number;
    sprintPoints: number;
    totalPoints: number;
    cumulativePoints: number;
}

export interface DriverPerformance {
    driverId: string;
    results: PerformanceResult[];
}

export interface ConstructorPerformance extends Race {
    sprintPoints: number;
    totalPoints: number;
    cumulativePoints: number;
    sprintResults: any[]; // Or a more specific type if needed
}
