import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

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

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Drivers', route: '/drivers', icon: '🏎️' },
    { label: 'Teams', route: '/teams', icon: '🏁' },
    { label: 'Races', route: '/races', icon: '🏆' },
    { label: 'Circuits', route: '/circuits', icon: '🗺️' },
    { label: 'Analytics', route: '/analytics', icon: '📈' }
  ]

}
