import { CommonModule } from '@angular/common';
import { Component, computed, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';
import { SeasonService } from '../../../core/services/season.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private themeService = inject(ThemeService);
  private seasonService = inject(SeasonService);

  isDarkMode = this.themeService.isDarkMode;
  selectedSeason = this.seasonService.selectedSeason;
  toggleSidebarEvent = output<void>(); // Output event for parent

  seasonOptions = computed(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 2021 + 1 }, (_, i) => (current - i).toString());
  });

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSeasonChange(season: string): void {
    this.seasonService.setSeason(season);
  }

  toggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }
}
