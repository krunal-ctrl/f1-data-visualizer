import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { F1ApiService } from '../../core/services/f1-api.service';
import { SeasonService } from '../../core/services/season.service';
import { Drivers } from '../drivers/drivers';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, 
    RouterModule,
    Card, 
    Loading, 
    StatCard
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  private apiService = inject(F1ApiService);
  private seasonService = inject(SeasonService);

  driverStandings = signal<any>(null);
  constructorStandings = signal<any>(null);
  raceCalendar = signal<any>(null);
  loading = signal(true);
  nextRace = signal<any>(null);

  constructor() {
    effect(() => {
      this.loadDashboardData(this.seasonService.selectedSeason());
    });
  }

  private loadDashboardData(season: string): void {
    this.loading.set(true);
    
    Promise.all([
      this.apiService.getDriverStandings(season).toPromise(),
      this.apiService.getConstructorStandings(season).toPromise(),
      this.apiService.getRaceCalendar(season).toPromise()
    ]).then(([drivers, constructors, races]) => {
      this.driverStandings.set(drivers);
      this.constructorStandings.set(constructors);
      this.raceCalendar.set(races || []);

      // Find next race
      const now = new Date();
      const upcoming = (races || []).find((race: any) => new Date(race.date) > now);
      this.nextRace.set(upcoming);

      this.loading.set(false);
    }).catch(error => {
      console.error("Error loading dashboard: ", error);
      this.loading.set(false);
    })
  }

  getTopDrivers(count: number = 3): any[] {
    return this.driverStandings()?.DriverStandings?.slice(0, count) || [];
  }

  getTopTeams(count: number = 3): any[] {
    return this.constructorStandings()?.ConstructorStandings?.slice(0, count) || [];
  }

  getDaysUntilNextRace(): number {
    if (!this.nextRace()) return 0;
    const now = new Date();
    const raceDate = new Date(this.nextRace().date);
    const diff = raceDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getCompletedRaces(): number {
    const now = new Date();
    return this.raceCalendar().filter((race: any) => new Date(race.date) < now).length;
  }

  getTotalRaces(): number {
    return this.raceCalendar().length;
  }

  getCurrentRound(): number {
    return this.getCompletedRaces() + 1;
  }
}
