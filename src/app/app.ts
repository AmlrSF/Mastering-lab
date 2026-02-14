import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectListComponent } from "./features/projects/components/project-list/project-list";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet, ProjectListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('project-manager');
}
