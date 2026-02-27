import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Card } from '../../../shared/components/card/card';
import { Loading } from '../../../shared/components/loading/loading';
import { LineChart } from '../../../shared/components/line-chart/line-chart';
import { F1ApiService } from '../../../core/services/f1-api.service';
import { getTeamColor } from '../../../shared/utils/team-colors.util';
import { SeasonService } from '../../../core/services/season.service';
import { ConstructorStanding } from '../../../core/models/team.model';
import { ConstructorPerformance } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-constructors-detail',
  imports: [
    CommonModule,
    RouterModule,
    Card,
    Loading,
    LineChart,
  ],
  templateUrl: './constructors-detail.html',
  styleUrl: './constructors-detail.scss',
})
export class ConstructorsDetail {
  private apiService = inject(F1ApiService);
  private route = inject(ActivatedRoute);
  private seasonService = inject(SeasonService);
  selectedSeason = this.seasonService.selectedSeason();

  constructorId = signal('');
  teamInfo = signal<ConstructorStanding | null>(null);
  raceResults = signal<ConstructorPerformance[]>([])
  loading = signal(false);

  teamColors = computed(() => {
    if (!this.constructorId()) return null;
    return getTeamColor(this.constructorId());
  });

  pointsProgressionData = computed(() => {
    const results = this.raceResults();
    const info = this.teamInfo();
    if (!results.length || !info) return [];

    return [{
      name: info.constructor.name,
      series: results.map((race: ConstructorPerformance) => ({
        name: `R${race.round}`,
        value: race.cumulativePoints,
        extra: {
          round: race.round,
          raceName: race.raceName,
          pointsScored: race.totalPoints,
          isSprintRace: race.sprintResults.length > 0,
          driverBreakdown: this.apiService.getDriverBreakDownForRace(race),
        }
      }))
    }];
  });

  teamDriversData = computed(() => {
    const races = this.raceResults();
    const info = this.teamInfo();
    if (!races.length || !info) return [];

    const driverMap = new Map<string, any>();
    races.forEach(race => {
      this.apiService.getDriverBreakDownForRace(race).forEach(d => {
        if (!driverMap.has(d.driver.driverId)) {
          driverMap.set(d.driver.driverId, {
            driver: d.driver,
            points: 0,
            sprintPoints: 0,
            totalPoints: 0
          });
        }

        const agg = driverMap.get(d.driver.driverId);
        agg.points += d.points;
        agg.sprintPoints += d.sprintPoints;
        agg.totalPoints += d.points + d.sprintPoints;
      });
    });

    return Array.from(driverMap.values());
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.constructorId.set(params['id']);
      effect(() => {
        this.selectedSeason = this.seasonService.selectedSeason();
        this.loadTeamData(this.seasonService.selectedSeason());
      });
    });
  }

  loadTeamData(season: string) {
    this.loading.set(true);
    // Get team from standings
    this.apiService.getConstructorStandings(season).subscribe({
      next: (standings) => {
        const team = standings?.find(
          (t: ConstructorStanding) => t.constructor.constructorId === this.constructorId()
        );
        this.teamInfo.set(team || null);

        if (team) {
          this.loadRaceResults(season);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading team:', err);
        this.loading.set(false);
      }
    });
  }

  private loadRaceResults(season: string): void {
    this.apiService.getConstructorRaceResults(this.constructorId(), season).subscribe({
      next: (results) => {
        this.raceResults.set(results);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading race results:', err);
        this.loading.set(false);
      }
    });
  }

  get averagePointsPerRace(): number {
    const info = this.teamInfo();
    if (!info) return 0;
    const points = info.points;
    return parseFloat((points / 24).toFixed(1));
  }

  get bestRace(): number {
    if (!this.raceResults().length) return 0;
    return Math.max(...this.raceResults().map(r => r.totalPoints));
  }
}
