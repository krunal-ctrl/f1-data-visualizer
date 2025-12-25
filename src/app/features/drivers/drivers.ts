import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BarChart } from '../../shared/components/bar-chart/bar-chart';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { F1ApiService } from '../../core/services/f1-api.service';
import { SeasonService } from '../../core/services/season.service';

@Component({
  selector: 'app-drivers',
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    Card, 
    Loading,
    BarChart
  ],
  templateUrl: './drivers.html',
  styleUrl: './drivers.scss',
})
export class Drivers {
  private apiService = inject(F1ApiService);
  private seasonService = inject(SeasonService);

  driverStandings = signal<any>(null);
  loading = signal(true);
  searchTerm = signal('');
  selectedTeam = signal('all');

  constructor() {
    effect(() => {
      this.loadDrivers(this.seasonService.selectedSeason());
    });
  }

  private loadDrivers(season: string): void {
    this.loading.set(true);
    this.apiService.getDriverStandings(season).subscribe({
      next: (data) => {
        this.driverStandings.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching driver standings:', error);
        this.loading.set(false);
      }
    })
  }

  get filteredDrivers(): any[] {

    let drivers = this.driverStandings()?.DriverStandings || [];

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      drivers = drivers.filter((d: any) => 
        d.Driver.givenName.toLowerCase().includes(term) || 
        d.Driver.familyName.toLowerCase().includes(term) ||
        d.Driver.code.toLowerCase().includes(term)
      );
    }

    // Filter by selected team
    if (this.selectedTeam() && this.selectedTeam() !== 'all') {
      drivers = drivers.filter((d: any) => 
        d.Constructors[0]?.constructorId === this.selectedTeam()
      );
    }

    return drivers;
  }

  get teams(): string[] {
    const drivers = this.driverStandings().DriverStandings || [];
    const teamsSet = new Set<string>(
      drivers.map((d: any) => d.Constructors[0]?.constructorId)
    );
    return Array.from(teamsSet);
  }

  get pointsChartData(): any[] {
    return this.filteredDrivers.slice(0, 10).map((d: any) => ({
      name: d.Driver.code,
      value: parseInt(d.points)
    }))
  }

  get winsChartData(): any[] {
    return this.filteredDrivers
      .slice(0, 10)
      .filter((d: any) => parseInt(d.wins) > 0)
      .map((d: any) => ({
        name: d.Driver.code,
        value: parseInt(d.wins)
      }));
  }

  get driverColors(): any[] {
    return this.filteredDrivers.slice(0, 10).map((d: any) => ({
      name: d.Driver.code,
      value: this.getTeamColor(d.Constructors[0]?.constructorId)
    }))
  }

  getTeamColor(constructorId: string): string {
    return this.apiService.getTeamColor(constructorId);
  }
}
