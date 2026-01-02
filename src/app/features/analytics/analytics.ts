import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
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
})
export class Analytics {
  private apiService = inject(F1ApiService);
  private seasonService = inject(SeasonService);

  driverStandings = signal<any>(null);
  constructorStandings = signal<any>(null);
  raceCalendar = signal<any[]>([]);
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
          if (drivers?.DriverStandings?.length >= 2) {
            this.selectedDriver1.set(drivers.DriverStandings[0].Driver.driverId);
            this.selectedDriver2.set(drivers.DriverStandings[1].Driver.driverId);
          }
        }, error: err => {
          console.error('Error loading race data:', err);
        }
      });
  }

  // Championship Prediction
  championshipPrediction = computed(() => {
    const standings = this.driverStandings()?.DriverStandings || [];
    if (standings.length === 0) return [];

    const racesRemaining = this.getRacesRemaining();
    const sprintRacesRemaining = this.getSprintRacesRemaining();
    // Calculate max points available
    const maxPointsFromRaces = racesRemaining * 25; // 25 for win + 1 for fastest lap
    const maxPointsFromSprints = sprintRacesRemaining * 8; // Sprint: 8-7-6-5-4-3-2-1
    const maxPointsAvailable = maxPointsFromRaces + maxPointsFromSprints;

    const leaderPoints = parseInt(standings[0].points);

    // Find all drivers who can mathematically win
    const contenders = standings.filter((driver: any) => {
      const driverPoints = parseInt(driver.points);
      const maxPossiblePoints = driverPoints + maxPointsAvailable;
      return maxPossiblePoints >= leaderPoints;
    });

    if (contenders.length === 0) return [];

    // Calculate win probability for each contender
    const predictions = contenders.map((driver: any) => {
      const driverPoints = parseInt(driver.points);
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
        const positionPenalty = (parseInt(driver.position) - 1) * 3;
        const winsBonus = parseInt(driver.wins) * 2;

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
      name: `${p.driver.Driver.givenName} ${p.driver.Driver.familyName}`,
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
    const standings = this.driverStandings()?.DriverStandings || [];
    return standings.slice(0, 5).map((s: any) => ({
      name: s.Driver.familyName,
      value: parseInt(s.points)
    }));
  });

  // Wins Distribution
  winsDistribution = computed(() => {
    const standings = this.driverStandings()?.DriverStandings || [];
    return standings
      .filter((s: any) => parseInt(s.wins) > 0)
      .map((s: any) => ({
        name: s.Driver.familyName,
        value: parseInt(s.wins)
      }));
  });

  // Team Performance Matrix
  teamPerformanceData = computed(() => {
    const standings = this.constructorStandings()?.ConstructorStandings || [];
    return standings.map((s: any) => ({
      name: s.Constructor.name,
      value: parseInt(s.points)
    }));
  });

  // Points Progression (Top 3 drivers)
  pointsProgressionData = computed(() => {
    const standings = this.driverStandings()?.DriverStandings?.slice(0, 3) || [];
    const races = this.raceCalendar().length;

    return standings.map((driver: any) => {
      const totalPoints = parseInt(driver.points);
      const avgPerRace = totalPoints / races;

      return {
        name: driver.Driver.familyName,
        series: Array.from({ length: races }, (_, i) => ({
          name: `R${i + 1}`,
          value: Math.floor(avgPerRace * (i + 1))
        }))
      };
    });
  });

  // Statistical Leaders
  statisticalLeaders = computed(() => {
    const standings = this.driverStandings()?.DriverStandings || [];
    if (standings.length === 0) return {
      mostPoints: null,
      mostWins: null,
      mostConsistent: null
    };

    const mostPoints = standings[0];
    const mostWins = standings.reduce((prev: any, curr: any) =>
      parseInt(curr.wins) > parseInt(prev.wins) ? curr : prev
    );

    // Consistency: points per race
    const withConsistency = standings.map((s: any) => ({
      ...s,
      consistency: parseInt(s.points) / this.raceCalendar().length
    }));
    const mostConsistent = withConsistency.reduce((prev: any, curr: any) =>
      curr.consistency > prev.consistency ? curr : prev
    );

    return { mostPoints, mostWins, mostConsistent };
  });

  // Comparison Data
  comparisonData = computed(() => {
    const standings = this.driverStandings()?.DriverStandings || [];
    const driver1 = standings.find((d: any) => d.Driver.driverId === this.selectedDriver1());
    const driver2 = standings.find((d: any) => d.Driver.driverId === this.selectedDriver2());

    if (!driver1 || !driver2) return null;

    return {
      driver1: {
        name: `${driver1.Driver.givenName} ${driver1.Driver.familyName}`,
        points: parseInt(driver1.points),
        wins: parseInt(driver1.wins),
        position: parseInt(driver1.position),
        avgPointsPerRace: (parseInt(driver1.points) / this.raceCalendar().length).toFixed(1)
      },
      driver2: {
        name: `${driver2.Driver.givenName} ${driver2.Driver.familyName}`,
        points: parseInt(driver2.points),
        wins: parseInt(driver2.wins),
        position: parseInt(driver2.position),
        avgPointsPerRace: (parseInt(driver2.points) / this.raceCalendar().length).toFixed(1)
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

  get drivers(): any[] {
    return this.driverStandings()?.DriverStandings || [];
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
    return remainingRaces.filter(race => race?.Sprint?.date).length;
  }
}
