import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AreaChart } from '../../shared/components/area-chart/area-chart';
import { BarChart } from '../../shared/components/bar-chart/bar-chart';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { PieChart } from '../../shared/components/pie-chart/pie-chart';
import { F1ApiService } from '../../core/services/f1-api.service';
import { SeasonService } from '../../core/services/season.service';
import { finalize, forkJoin } from 'rxjs';
import { DriverStanding } from '../../core/models/driver.model';
import { ConstructorStanding } from '../../core/models/team.model';
import { Race } from '../../core/models/race.model';

@Component({
  selector: 'app-analytics',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Card,
    Loading,
    BarChart,
    PieChart,
    AreaChart
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Analytics {
  private apiService = inject(F1ApiService);
  private seasonService = inject(SeasonService);

  driverStandings = signal<DriverStanding[]>([]);
  constructorStandings = signal<ConstructorStanding[]>([]);
  raceCalendar = signal<Race[]>([]);
  loading = signal(true);

  selectedDriver1 = signal<string>('');
  selectedDriver2 = signal<string>('');

  constructor() {
    effect(() => {
      this.loadAnalyticsData(this.seasonService.selectedSeason());
    });
  }

  private loadAnalyticsData(year: string): void {
    this.loading.set(true);

    forkJoin({
      drivers: this.apiService.getDriverStandings(year),
      constructors: this.apiService.getConstructorStandings(year),
      races: this.apiService.getRaceCalendar(year)
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ drivers, constructors, races }) => {
          this.driverStandings.set(drivers);
          this.constructorStandings.set(constructors);
          this.raceCalendar.set(races || []);

          // Set default comparison drivers (top 2)
          if (drivers.length >= 2) {
            this.selectedDriver1.set(drivers[0].driver.driverId);
            this.selectedDriver2.set(drivers[1].driver.driverId);
          }
        }, error: err => {
          console.error('Error loading race data:', err);
        }
      });
  }

  // Championship Prediction
  championshipPrediction = computed(() => {
    const standings = this.driverStandings();
    if (standings.length === 0) return [];

    const racesRemaining = this.getRacesRemaining();
    const sprintRacesRemaining = this.getSprintRacesRemaining();
    // Calculate max points available
    const maxPointsFromRaces = racesRemaining * 25; // 25 for win + 1 for fastest lap
    const maxPointsFromSprints = sprintRacesRemaining * 8; // Sprint: 8-7-6-5-4-3-2-1
    const maxPointsAvailable = maxPointsFromRaces + maxPointsFromSprints;

    const leaderPoints = standings[0].points;

    // Find all drivers who can mathematically win
    const contenders = standings.filter((driver: DriverStanding) => {
      const driverPoints = driver.points;
      const maxPossiblePoints = driverPoints + maxPointsAvailable;
      return maxPossiblePoints >= leaderPoints;
    });

    if (contenders.length === 0) return [];

    // Calculate win probability for each contender
    const predictions = contenders.map((driver: DriverStanding) => {
      const driverPoints = driver.points;
      const pointsGap = leaderPoints - driverPoints;

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
        points: driverPoints,
        winChance
      };
    });

    // Normalize probabilities to sum to 100%
    const totalChance = predictions.reduce((sum: number, p: any) => sum + p.winChance, 0);

    return predictions.map((p: any) => ({
      name: `${p.driver.driver.givenName} ${p.driver.driver.familyName}`,
      value: parseFloat((p.winChance / totalChance * 100).toFixed(1)),
      extra: {
        position: p.driver.position,
        points: p.points,
        wins: p.driver.wins,
        pointsGap: leaderPoints - p.points
      }
    })).filter((p: any) => p.value >= 0.5); // Only show drivers with at least 0.5% chance
  });

  // Points Distribution (Top 5)
  pointsDistribution = computed(() => {
    const standings = this.driverStandings();
    return standings.slice(0, 5).map((s: DriverStanding) => ({
      name: s.driver.familyName,
      value: s.points
    }));
  });

  // Wins Distribution
  winsDistribution = computed(() => {
    const standings = this.driverStandings();
    return standings
      .filter((s: DriverStanding) => s.wins > 0)
      .map((s: DriverStanding) => ({
        name: s.driver.familyName,
        value: s.wins
      }));
  });

  // Team Performance Matrix
  teamPerformanceData = computed(() => {
    const standings = this.constructorStandings();
    return standings.map((s: ConstructorStanding) => ({
      name: s.constructor.name,
      value: s.points
    }));
  });

  // Points Progression (Top 3 drivers)
  pointsProgressionData = computed(() => {
    const standings = this.driverStandings().slice(0, 3);
    const races = this.raceCalendar().length;

    return standings.map((driver: DriverStanding) => {
      const totalPoints = driver.points;
      const avgPerRace = totalPoints / races;

      return {
        name: driver.driver.familyName,
        series: Array.from({ length: races }, (_, i) => ({
          name: `R${i + 1}`,
          value: Math.floor(avgPerRace * (i + 1))
        }))
      };
    });
  });

  // Statistical Leaders
  statisticalLeaders = computed(() => {
    const standings = this.driverStandings();
    if (standings.length === 0) return {
      mostPoints: null,
      mostWins: null,
      mostConsistent: null
    };

    const mostPoints = standings[0];
    const mostWins = standings.reduce((prev: DriverStanding, curr: DriverStanding) =>
      curr.wins > prev.wins ? curr : prev
    );

    // Consistency: points per race
    const withConsistency = standings.map((s: DriverStanding) => ({
      ...s,
      consistency: s.points / this.raceCalendar().length
    }));
    const mostConsistent = withConsistency.reduce((prev: any, curr: any) =>
      curr.consistency > prev.consistency ? curr : prev
    );

    return { mostPoints, mostWins, mostConsistent };
  });

  // Comparison Data
  comparisonData = computed(() => {
    const standings = this.driverStandings();
    const driver1 = standings.find((d: DriverStanding) => d.driver.driverId === this.selectedDriver1());
    const driver2 = standings.find((d: DriverStanding) => d.driver.driverId === this.selectedDriver2());

    if (!driver1 || !driver2) return null;

    return {
      driver1: {
        name: `${driver1.driver.givenName} ${driver1.driver.familyName}`,
        points: driver1.points,
        wins: driver1.wins,
        position: driver1.position,
        avgPointsPerRace: (driver1.points / this.raceCalendar().length).toFixed(1)
      },
      driver2: {
        name: `${driver2.driver.givenName} ${driver2.driver.familyName}`,
        points: driver2.points,
        wins: driver2.wins,
        position: driver2.position,
        avgPointsPerRace: (driver2.points / this.raceCalendar().length).toFixed(1)
      }
    };
  });

  // Comparison Chart Data
  comparisonChartData = computed(() => {
    const comparison = this.comparisonData();
    if (!comparison) return [];

    return [
      {
        name: 'Points',
        series: [
          { name: comparison.driver1.name.split(' ')[1], value: comparison.driver1.points },
          { name: comparison.driver2.name.split(' ')[1], value: comparison.driver2.points }
        ]
      },
      {
        name: 'Wins',
        series: [
          { name: comparison.driver1.name.split(' ')[1], value: comparison.driver1.wins },
          { name: comparison.driver2.name.split(' ')[1], value: comparison.driver2.wins }
        ]
      }
    ];
  });

  get driversList(): DriverStanding[] {
    return this.driverStandings();
  }

  getRacesRemaining(): number {
    const now = new Date();
    return this.raceCalendar().filter(race => new Date(race.date) > now).length;
  }

  getCompletedRaces(): number {
    const now = new Date();
    return this.raceCalendar().filter(race => new Date(race.date) <= now).length;
  }

  // Helper method to count sprint races in remaining calendar
  getSprintRacesRemaining(): number {
    const now = new Date();
    const remainingRaces = this.raceCalendar().filter(race => new Date(race.date) > now);
    return remainingRaces.filter(race => race.sprint?.date).length;
  }
}
