import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { F1ApiService } from '../../core/services/f1-api.service';
import { SeasonService } from '../../core/services/season.service';

@Component({
  selector: 'app-races',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Card,
    Loading
  ],
  templateUrl: './races.html',
  styleUrl: './races.scss',
})
export class Races {
  private apiService = inject(F1ApiService);
  private seasonService = inject(SeasonService);

  raceCalendar = signal<any[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  selectedFilter = signal('all');

  constructor() {
    effect(() => {
      this.loadRaces(this.seasonService.selectedSeason());
    });
  }

  loadRaces(year: string) {
    this.loading.set(true);
    this.apiService.getRaceCalendar(year).subscribe({
      next: (data) => {
        this.raceCalendar.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading races:', err);
        this.loading.set(false);
      }
    });
  }

  filteredRaces = computed(() => {
    let races = this.raceCalendar();
    const now = new Date();

    // Filter by status
    if (this.selectedFilter() === 'completed') {
      races = races.filter(race => new Date(race.date) < now);
    } else if (this.selectedFilter() === 'upcoming') {
      races = races.filter(race => new Date(race.date) >= now);
    }

    // Filter by search
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      races = races.filter(race =>
        race.raceName.toLowerCase().includes(term) ||
        race.Circuit.circuitName.toLowerCase().includes(term) ||
        race.Circuit.Location.country.toLowerCase().includes(term) ||
        race.Circuit.Location.locality.toLowerCase().includes(term)
      );
    }

    return races;
  });

  completedCount = computed(() => {
    const now = new Date();
    return this.raceCalendar().filter(race => new Date(race.date) < now).length;
  });

  upcomingCount = computed(() => {
    const now = new Date();
    return this.raceCalendar().filter(race => new Date(race.date) >= now).length;
  });

  nextRace = computed(() => {
    const now = new Date();
    return this.raceCalendar().find(race => new Date(race.date) >= now);
  });

  isRaceCompleted(raceDate: string): boolean {
    return new Date(raceDate) < new Date();
  }

  getDaysUntilRace(raceDate: string): number {
    const now = new Date();
    const race = new Date(raceDate);
    const diff = race.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}
