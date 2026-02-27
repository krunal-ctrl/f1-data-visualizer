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
import { AnalyticsService } from '../../core/services/analytics.service';
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
  private analyticsService = inject(AnalyticsService);

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
    return this.analyticsService.calculateChampionshipPrediction(
      this.driverStandings(),
      this.raceCalendar()
    );
  });

  // Points Distribution (Top 5)
  pointsDistribution = computed(() => {
    return this.driverStandings().slice(0, 5).map((s: DriverStanding) => ({
      name: s.driver.familyName,
      value: s.points
    }));
  });

  // Wins Distribution
  winsDistribution = computed(() => {
    return this.driverStandings()
      .filter((s: DriverStanding) => s.wins > 0)
      .map((s: DriverStanding) => ({
        name: s.driver.familyName,
        value: s.wins
      }));
  });

  // Team Performance Matrix
  teamPerformanceData = computed(() => {
    return this.constructorStandings().map((s: ConstructorStanding) => ({
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
      const avgPerRace = totalPoints / (races || 1);

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
    const raceCount = this.raceCalendar().length || 1;
    const withConsistency = standings.map((s: DriverStanding) => ({
      ...s,
      consistency: s.points / raceCount
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

    const raceCount = this.raceCalendar().length || 1;

    return {
      driver1: {
        name: `${driver1.driver.givenName} ${driver1.driver.familyName}`,
        points: driver1.points,
        wins: driver1.wins,
        position: driver1.position,
        avgPointsPerRace: (driver1.points / raceCount).toFixed(1)
      },
      driver2: {
        name: `${driver2.driver.givenName} ${driver2.driver.familyName}`,
        points: driver2.points,
        wins: driver2.wins,
        position: driver2.position,
        avgPointsPerRace: (driver2.points / raceCount).toFixed(1)
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
}
