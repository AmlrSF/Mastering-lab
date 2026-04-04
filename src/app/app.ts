// src/app/app.ts
import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectListComponent } from "./features/projects/components/project-list/project-list";
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ProjectListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('project-manager');
  private themeService = inject(ThemeService);
  
  // Get theme as signal for reactivity
  currentTheme = this.themeService.theme;

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  getThemeIcon(): string {
    return this.currentTheme() === 'light' ? '🌙' : '☀️';
  }

  getThemeText(): string {
    return this.currentTheme() === 'light' ? 'Mode sombre' : 'Mode clair';
  }
}