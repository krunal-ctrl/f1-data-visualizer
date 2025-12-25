import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LineChart } from '../../../shared/components/line-chart/line-chart';
import { Loading } from '../../../shared/components/loading/loading';
import { F1ApiService } from '../../../core/services/f1-api.service';
import { Card } from '../../../shared/components/card/card';
import { BarChart } from '../../../shared/components/bar-chart/bar-chart';
import { SeasonService } from '../../../core/services/season.service';

@Component({
  selector: 'app-driver-detail',
  imports: [
    CommonModule,
    RouterModule,
    Card,
    Loading,
    LineChart,
    BarChart
  ],
  templateUrl: './driver-detail.html',
  styleUrl: './driver-detail.scss',
})
export class DriverDetail {
  private apiService = inject(F1ApiService);
  private route = inject(ActivatedRoute);
  private seasonService = inject(SeasonService);

  driverId = signal<string>('');
  driverInfo = signal<any>(null);
  raceResults = signal<any>([]);
  loading = signal<boolean>(true);

  // Computed values
  pointsProgressionData = computed(() => {
    if (!this.raceResults().length || !this.driverInfo()) return [];
    
    return [{
      name: this.driverInfo().Driver.code,
      series: this.raceResults().map((result: any) => ({
        name: `R${result.round}`,
        value: result.cumulativePoints,
        extra: {
          raceName: result.raceName,
          position: +result.position,
          pointsScored: +result.totalPoints,
          round: result.round
        }
      }))
    }];
  });

  positionsByRaceData = computed(() => {
    if (!this.raceResults().length) return [];
    
    return this.raceResults().map((result: any) => ({
      name: `R${result.round}`,
      value: result.position,
      extra: {
        raceName: result.raceName,
        points: result.totalPoints
      }
    }));
  });

  pointsScoredByRaceData = computed(() => {
    if (!this.raceResults().length) return [];
    
    return this.raceResults().map((result: any) => ({
      name: `R${result.round}`,
      value: result.totalPoints,
      extra: {
        raceName: result.raceName,
        position: result.position
      }
    }));
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.driverId.set(params['id']);
      effect(() => {
        this.fetchDriverInfo(this.seasonService.selectedSeason());
      });
    });
  }

  fetchDriverInfo(season: string) {
    // Get driver from standings
    this.apiService.getDriverStandings(season).subscribe({
      next: (standings) => {
        const driver = standings?.DriverStandings?.find(
          (d: any) => d.Driver.driverId === this.driverId()
        );
        this.driverInfo.set(driver);
        this.loading.set(false);
        if (driver) this.loadRaceResults();
      },
      error: (err) => {
        console.error('Error loading driver:', err);
        this.loading.set(false);
      }
    });
  }

  private loadRaceResults(): void {
    this.loading.set(true);
    this.apiService.getDriverRaceResults(this.driverId(), this.seasonService.selectedSeason()).subscribe({
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

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  get bestFinish(): number {
    if (!this.raceResults().length) return 0;
    return Math.min(...this.raceResults().map((r: any) => r.position));
  }

  get podiums(): number {
    return this.raceResults().filter((r: any) => r.position <= 3).length;
  }

  get pointsFinishes(): number {
    return this.raceResults().filter((r: any) => r.position <= 10).length;
  }

  get averagePosition(): number {
    if (!this.raceResults().length) return 0;
    const sum = this.raceResults().reduce((acc: number, r: any) => acc + r.position, 0);
    return parseFloat((sum / this.raceResults().length).toFixed(2));
  }

  get dnfCount(): number {
    // Positions > 20 typically indicate DNF
    return this.raceResults().filter((r: any) => r.position > 20).length;
  }
}
