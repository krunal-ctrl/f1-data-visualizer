import { CommonModule } from '@angular/common';
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {

  currentYear = new Date().getFullYear();
  isOpen = signal(false); // Sidebar closed by default on mobile

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Drivers', route: '/drivers', icon: '🏎️' },
    { label: 'Constructors', route: '/constructors', icon: '🔧' },
    { label: 'Races', route: '/races', icon: '🏆' },
    { label: 'Circuits', route: '/circuits', icon: '🗺️' },
    { label: 'Analytics', route: '/analytics', icon: '📈' }
  ]

  toggleSidebar(): void {
    this.isOpen.update(value => !value);
  }

  closeSidebar(): void {
    this.isOpen.set(false);
  }

}
