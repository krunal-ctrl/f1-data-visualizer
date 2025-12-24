import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  currentYear = new Date().getFullYear();

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Drivers', route: '/drivers', icon: '🏎️' },
    { label: 'Constructors', route: '/constructors', icon: '🔧' },
    { label: 'Races', route: '/races', icon: '🏆' },
    { label: 'Circuits', route: '/circuits', icon: '🗺️' },
    { label: 'Analytics', route: '/analytics', icon: '📈' }
  ]

}
