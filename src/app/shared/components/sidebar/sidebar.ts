import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { F1ApiService } from '../../../core/services/f1-api.service';

interface MenuItem {
  label: string,
  route: string,
  icon: string,
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  private f1ApiService = inject(F1ApiService);
  currentYear = this.f1ApiService.getCurrentSeason();

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Drivers', route: '/drivers', icon: '🏎️' },
    { label: 'Constructors', route: '/constructors', icon: '🔧' },
    { label: 'Races', route: '/races', icon: '🏆' },
    { label: 'Circuits', route: '/circuits', icon: '🗺️' },
    { label: 'Analytics', route: '/analytics', icon: '📈' }
  ]

}
