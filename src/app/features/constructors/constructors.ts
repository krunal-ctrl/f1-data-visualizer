import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { BarChart } from '../../shared/components/bar-chart/bar-chart';
import { F1ApiService } from '../../core/services/f1-api.service';
import { SeasonService } from '../../core/services/season.service';
import { getTeamPrimaryColor } from '../../shared/utils/team-colors.util';

@Component({
  selector: 'app-constructors',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Card,
    Loading,
    BarChart,
  ],
  templateUrl: './constructors.html',
  styleUrl: './constructors.scss',
})
export class Constructors {
  private apiService = inject(F1ApiService);
  private seasonService = inject(SeasonService);

  constructorStandings = signal<any>(null);
  loading = signal(false);
  searchTerm = signal('');

  constructor() {
    effect(() => {
      this.fetchConstructorStandings(this.seasonService.selectedSeason());
    });
  }

  fetchConstructorStandings(season: string): void {
    this.loading.set(true);
    this.apiService.getConstructorStandings(season).subscribe({
      next: (data) => {
        this.constructorStandings.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching constructor standings:', error);
        this.loading.set(false);
      }
    });
  }

  filteredTeams = computed(() => {
    let teams = this.constructorStandings()?.ConstructorStandings || [];

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      teams = teams.filter((team: any) =>
        team.Constructor.name.toLowerCase().includes(term) ||
        team.Constructor.constructorId.toLowerCase().includes(term)
      );
    }

    return teams;
  })

  pointsChartData(): any {
    return this.filteredTeams().map((team: any) => ({
      name: team.Constructor.name,
      value: parseInt(team.points, 10)
    }));
  }

  winsChartData(): any {
    return this.filteredTeams().map((team: any) => ({
      name: team.Constructor.name,
      value: parseInt(team.wins, 10)
    }));
  }

  getTeamColor(constructorId: string): string {
    return getTeamPrimaryColor(constructorId);
  }
}
