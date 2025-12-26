import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Card } from '../../../shared/components/card/card';
import { Loading } from '../../../shared/components/loading/loading';
import { LineChart } from '../../../shared/components/line-chart/line-chart';
import { F1ApiService } from '../../../core/services/f1-api.service';
import { getTeamColor } from '../../../shared/utils/team-colors.util';
import { SeasonService } from '../../../core/services/season.service';

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
  teamInfo = signal<any>(null);
  raceResults = signal<any[]>([])
  loading = signal(false);

  teamColors = computed(() => {
    if (!this.constructorId()) return null;
    return getTeamColor(this.constructorId());
  });

  pointsProgressionData = computed(() => {
    if (!this.raceResults().length || !this.teamInfo()) return [];

    return [{
      name: this.teamInfo().Constructor.name,
      series: this.raceResults().map(race => ({
        name: `R${race.round}`,
        value: race.cumulativePoints,
        extra: {
          round: race.round,
          raceName: race.raceName,
          pointsScored: race.totalPoints,
          isSprintRace: race.sprintResults.length > 0,
          // Get driver breakdown for this race
          driverBreakdown: this.apiService.getDriverBreakDownForRace(race),
        }
      }))
    }];
  });

  teamDriversData = computed(() => {
    const races = this.raceResults();
    if (!races.length || !this.teamInfo()) return [];

    const driverMap = new Map<string, any>();
    races.forEach(race => {
      this.apiService.getDriverBreakDownForRace(race).forEach(d => {

        console.log('Driver aggregation:', driverMap);

        if (!driverMap.has(d.Driver.driverId)) {
          driverMap.set(d.Driver.driverId, {
            Driver: d.Driver,
            points: 0,
            sprintPoints: 0,
            totalPoints: 0
          });
        }

        const agg = driverMap.get(d.Driver.driverId);

        agg.points += d.points;
        agg.sprintPoints += d.sprintPoints;
        agg.totalPoints += d.points + d.sprintPoints;
      });
    });

    console.log('Driver aggregation:', driverMap);

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
    // Get team from standings
    this.apiService.getConstructorStandings(season).subscribe({
      next: (standings) => {
        const team = standings?.ConstructorStandings?.find(
          (t: any) => t.Constructor.constructorId === this.constructorId()
        );
        this.teamInfo.set(team);

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
    if (!this.teamInfo()) return 0;
    const points = parseInt(this.teamInfo().points);
    return parseFloat((points / 24).toFixed(1));
  }

  get bestRace(): number {
    if (!this.raceResults().length) return 0;
    return Math.max(...this.raceResults().map(r => r.points));
  }
}
