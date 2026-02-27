import { Injectable } from '@angular/core';
import { DriverStanding } from '../models/driver.model';
import { Race } from '../models/race.model';

export interface ChampionshipPrediction {
  name: string;
  value: number;
  extra: {
    position: number;
    points: number;
    wins: number;
    pointsGap: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  calculateChampionshipPrediction(
    standings: DriverStanding[],
    raceCalendar: Race[]
  ): ChampionshipPrediction[] {
    if (standings.length === 0) return [];

    const now = new Date();
    const racesRemaining = raceCalendar.filter(race => new Date(race.date) > now).length;
    const sprintRacesRemaining = raceCalendar
      .filter(race => new Date(race.date) > now)
      .filter(race => race.sprint?.date).length;

    // Calculate max points available
    const maxPointsFromRaces = racesRemaining * 25; // 25 for win + 1 for fastest lap
    const maxPointsFromSprints = sprintRacesRemaining * 8; // Sprint: 8-7-6-5-4-3-2-1
    const maxPointsAvailable = maxPointsFromRaces + maxPointsFromSprints;

    const leaderPoints = standings[0].points;

    // Find all drivers who can mathematically win
    const contenders = standings.filter((driver) => {
      const maxPossiblePoints = driver.points + maxPointsAvailable;
      return maxPossiblePoints >= leaderPoints;
    });

    if (contenders.length === 0) return [];

    // Calculate win probability for each contender
    const predictions = contenders.map((driver) => {
      const pointsGap = leaderPoints - driver.points;

      let winChance: number;

      if (pointsGap === 0) {
        // Leader or tied - highest base probability
        winChance = 40 + (15 / contenders.length);
      } else if (pointsGap >= maxPointsAvailable) {
        // Mathematically eliminated
        winChance = 0;
      } else {
        // Calculate based on multiple factors
        const gapPercentage = pointsGap / maxPointsAvailable;
        const positionPenalty = (driver.position - 1) * 3;
        const winsBonus = driver.wins * 2;

        // Base probability inversely proportional to gap
        const baseProbability = (1 - gapPercentage) * 50;

        // Apply modifiers
        winChance = Math.max(1, baseProbability - positionPenalty + winsBonus);
      }

      return {
        driver,
        points: driver.points,
        winChance
      };
    });

    // Normalize probabilities to sum to 100%
    const totalChance = predictions.reduce((sum, p) => sum + p.winChance, 0);

    return predictions.map((p) => ({
      name: `${p.driver.driver.givenName} ${p.driver.driver.familyName}`,
      value: parseFloat((p.winChance / totalChance * 100).toFixed(1)),
      extra: {
        position: p.driver.position,
        points: p.points,
        wins: p.driver.wins,
        pointsGap: leaderPoints - p.points
      }
    })).filter((p) => p.value >= 0.5); // Only show drivers with at least 0.5% chance
  }
}
