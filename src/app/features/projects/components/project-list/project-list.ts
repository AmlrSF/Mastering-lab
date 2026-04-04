// src/app/features/projects/components/project-list/project-list.ts
import { Component, OnInit, inject } from '@angular/core';
import { ProjectService } from '../../../../core/services/project';
import { ThemeService } from '../../../../core/services/theme';
import { Project, Task } from '../../../../core/models/project.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  query, 
  stagger, 
  keyframes 
} from '@angular/animations';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./project-list.css'],
  standalone: true,
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-30px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger('50ms', [
            animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(30px)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('shakeAnimation', [
      transition('* => *', [
        animate('500ms', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-10px)', offset: 0.1 }),
          style({ transform: 'translateX(10px)', offset: 0.2 }),
          style({ transform: 'translateX(-10px)', offset: 0.3 }),
          style({ transform: 'translateX(10px)', offset: 0.4 }),
          style({ transform: 'translateX(-5px)', offset: 0.5 }),
          style({ transform: 'translateX(5px)', offset: 0.6 }),
          style({ transform: 'translateX(-2px)', offset: 0.7 }),
          style({ transform: 'translateX(2px)', offset: 0.8 }),
          style({ transform: 'translateX(0)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class ProjectListComponent implements OnInit {
  
  projects: Project[] = [];
  filteredProjects: Project[] = [];

  loading = true;
  error = '';

  showProjectModal = false;
  showTaskModal = false;
  showDeleteConfirmModal = false;
  showDetailsModal = false; 

  editingProject: Project | null = null;
  editingTask: Task | null = null;
  selectedProjectId: number | null = null;

  selectedProject: Project | null = null;

  itemToDelete: { type: 'project' | 'task'; id: number; projectId?: number } | null = null;

  projectForm: Partial<Project> = {
    name: '',
    description: '',
    status: 'En cours',
    tasks: [],
  };

  taskForm: Partial<Task> = {
    title: '',
    description: '',
    priority: 'Moyenne',
    status: 'En attente',
    dueDate: new Date(),
  };

  filterStatus: string = 'Tous';
  searchTerm: string = '';

  stats: any = {};
  
  notification: { message: string; type: 'success' | 'error' | 'info' } | null = null;
  animatedItemId: any | null = null;

  private themeService = inject(ThemeService);
  currentTheme = this.themeService.theme;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadStats();
    
    this.projectService.notifications$.subscribe(notification => {
      this.notification = notification;
    });
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (data: Project[]) => {
        this.projects = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Échec du chargement des projets';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadStats(): void {
    this.projectService.getProjectStats().subscribe((stats: any) => {
      this.stats = stats;
    });
  }

  applyFilters(): void {
    let filtered = [...this.projects];

    if (this.filterStatus !== 'Tous') {
      filtered = filtered.filter((p) => p.status === this.filterStatus);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
      );
    }

    this.filteredProjects = filtered;
  }

  onFilterChange(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  openAddProjectModal(): void {
    this.editingProject = null;
    this.projectForm = {
      name: '',
      description: '',
      status: 'En cours',
      tasks: [],
    };
    this.showProjectModal = true;
  }

  openEditProjectModal(project: Project): void {
    this.editingProject = project;
    this.projectForm = { ...project };
    this.showProjectModal = true;
  }

  closeProjectModal(): void {
    this.showProjectModal = false;
    this.editingProject = null;
  }

  saveProject(): void {
    if (!this.projectForm.name || !this.projectForm.description) {
      this.projectService.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (this.editingProject) {
      const updatedProject = {
        ...this.editingProject,
        ...this.projectForm,
      };
      this.projectService.updateProject(updatedProject).subscribe({
        next: () => {
          this.closeProjectModal();
          this.loadProjects();
          this.loadStats();
        },
        error: (err: any) => {
          this.error = 'Échec de la mise à jour du projet';
          console.error(err);
        },
      });
    } else {
      const newProject: Project = {
        name: this.projectForm.name || '',
        description: this.projectForm.description || '',
        status: (this.projectForm.status as 'En cours' | 'Terminé' | 'En pause') || 'En cours',
        tasks: [],
      };

      this.projectService.addProject(newProject).subscribe({
        next: () => {
          this.closeProjectModal();
          this.loadProjects();
          this.loadStats();
        },
        error: (err: any) => {
          this.error = "Échec de l'ajout du projet";
          console.error(err);
        },
      });
    }
  }

  confirmDeleteProject(id: number): void {
    this.itemToDelete = { type: 'project', id };
    this.showDeleteConfirmModal = true;
  }

  deleteProject(id: number): void {
    this.projectService.deleteProject(id).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.loadProjects();
          this.loadStats();
          this.cancelDelete();
        }
      },
      error: (err: any) => {
        this.error = 'Échec de la suppression du projet';
        console.error(err);
      },
    });
  }

  openProjectDetailsModal(projectId: number): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.selectedProject = project;
      this.showDetailsModal = true;
    } else {
      console.log(`Projet avec ID ${projectId} non trouvé`);
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProject = null;
  }

  openAddTaskModal(projectId: number): void {
    this.selectedProjectId = projectId;
    this.editingTask = null;
    this.taskForm = {
      title: '',
      description: '',
      priority: 'Moyenne',
      status: 'En attente',
      dueDate: new Date(),
    };
    this.showTaskModal = true;
  }

  openEditTaskModal(projectId: number, task: Task): void {
    this.selectedProjectId = projectId;
    this.editingTask = task;
    this.taskForm = { ...task };
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
    this.selectedProjectId = null;
  }

  saveTask(): void {
    if (!this.taskForm.title || !this.selectedProjectId) {
      this.projectService.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (this.editingTask && this.selectedProjectId) {
      const updatedTask = {
        ...this.editingTask,
        ...this.taskForm,
      };
      this.projectService.updateTask(this.selectedProjectId, updatedTask).subscribe({
        next: () => {
          this.closeTaskModal();
          this.loadProjects();
        },
        error: (err: any) => {
          this.error = 'Échec de la mise à jour de la tâche';
          console.error(err);
        },
      });
    } else if (this.selectedProjectId) {
      const newTask: Task = {
        title: this.taskForm.title || '',
        description: this.taskForm.description || '',
        priority: (this.taskForm.priority as 'Haute' | 'Moyenne' | 'Basse') || 'Moyenne',
        status: (this.taskForm.status as 'En attente' | 'En cours' | 'Terminé') || 'En attente',
        dueDate: this.taskForm.dueDate,
      };

      this.projectService.addTask(this.selectedProjectId, newTask).subscribe({
        next: () => {
          this.closeTaskModal();
          this.loadProjects();
        },
        error: (err: any) => {
          this.error = "Échec de l'ajout de la tâche";
          console.error(err);
        },
      });
    }
  }

  confirmDeleteTask(projectId: number, taskId: number): void {
    this.itemToDelete = { type: 'task', id: taskId, projectId };
    this.showDeleteConfirmModal = true;
  }

  deleteTask(projectId: number, taskId: number): void {
    this.projectService.deleteTask(projectId, taskId).subscribe({
      next: () => {
        this.loadProjects();
        this.cancelDelete();
      },
      error: (err: any) => {
        this.error = 'Échec de la suppression de la tâche';
        console.error(err);
      },
    });
  }

  updateTaskStatus(
    projectId: number,
    task: Task,
    newStatus: 'En attente' | 'En cours' | 'Terminé',
  ): void {
    this.animatedItemId = task.id;
    const updatedTask = { ...task, status: newStatus };
    this.projectService.updateTask(projectId, updatedTask).subscribe({
      next: () => {
        this.loadProjects();
        setTimeout(() => {
          this.animatedItemId = null;
        }, 500);
      },
      error: (err: any) => {
        this.error = 'Échec de la mise à jour du statut';
        console.error(err);
      },
    });
  }

  confirmDelete(): void {
    if (this.itemToDelete?.type === 'project' && this.itemToDelete.id) {
      this.deleteProject(this.itemToDelete.id);
    } else if (
      this.itemToDelete?.type === 'task' &&
      this.itemToDelete.id &&
      this.itemToDelete.projectId
    ) {
      this.deleteTask(this.itemToDelete.projectId, this.itemToDelete.id);
    }
  }

  cancelDelete(): void {
    this.itemToDelete = null;
    this.showDeleteConfirmModal = false;
  }

  getProjectProgress(project: Project): number {
    return this.projectService.getProjectProgressSync(project);
  }

  editTask(projectId: number, task: Task) {
    this.selectedProjectId = projectId;
    this.editingTask = task;
    this.taskForm = { ...task };
    this.showTaskModal = true;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'En cours':
        return 'status-in-progress';
      case 'Terminé':
        return 'status-completed';
      case 'En pause':
        return 'status-paused';
      default:
        return '';
    }
  }

  countTasksByStatus(project: Project, status: string): number {
    return project.tasks?.filter((t) => t.status === status).length || 0;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getNotificationClass(type: string): string {
    switch(type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }

  // Helper methods for dynamic theming
  getCardClass(): string {
    return this.currentTheme() === 'light' 
      ? 'bg-white hover:shadow-lg' 
      : 'bg-dark-200 hover:shadow-xl';
  }

  getTextClass(): string {
    return this.currentTheme() === 'light' 
      ? 'text-gray-800' 
      : 'text-gray-100';
  }

  getSubtextClass(): string {
    return this.currentTheme() === 'light' 
      ? 'text-gray-600' 
      : 'text-gray-400';
  }

  getInputClass(): string {
    return this.currentTheme() === 'light'
      ? 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
      : 'border-gray-600 bg-dark-200 text-gray-100 focus:ring-blue-400';
  }

  getModalClass(): string {
    return this.currentTheme() === 'light'
      ? 'bg-white'
      : 'bg-dark-200';
  }

  getButtonClass(type: 'primary' | 'secondary' | 'danger'): string {
    if (this.currentTheme() === 'light') {
      switch(type) {
        case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white';
        case 'secondary': return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
        case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
        default: return '';
      }
    } else {
      switch(type) {
        case 'primary': return 'bg-blue-500 hover:bg-blue-600 text-white';
        case 'secondary': return 'bg-gray-700 hover:bg-gray-600 text-gray-100';
        case 'danger': return 'bg-red-500 hover:bg-red-600 text-white';
        default: return '';
      }
    }
  }

  getStatusBadgeClass(status: string): string {
    if (this.currentTheme() === 'light') {
      switch(status) {
        case 'En cours': return 'bg-yellow-100 text-yellow-800';
        case 'Terminé': return 'bg-green-100 text-green-800';
        case 'En pause': return 'bg-gray-100 text-gray-800';
        default: return '';
      }
    } else {
      switch(status) {
        case 'En cours': return 'bg-yellow-900 text-yellow-200';
        case 'Terminé': return 'bg-green-900 text-green-200';
        case 'En pause': return 'bg-gray-800 text-gray-300';
        default: return '';
      }
    }
  }

  getTaskStatusClass(status: string): string {
    if (this.currentTheme() === 'light') {
      switch(status) {
        case 'En attente': return 'border-l-yellow-500 bg-yellow-50';
        case 'En cours': return 'border-l-blue-500 bg-blue-50';
        case 'Terminé': return 'border-l-green-500 bg-green-50';
        default: return 'border-l-gray-500 bg-gray-50';
      }
    } else {
      switch(status) {
        case 'En attente': return 'border-l-yellow-500 bg-yellow-900/20';
        case 'En cours': return 'border-l-blue-500 bg-blue-900/20';
        case 'Terminé': return 'border-l-green-500 bg-green-900/20';
        default: return 'border-l-gray-500 bg-gray-800';
      }
    }
  }

  getPriorityClass(priority: string): string {
    if (this.currentTheme() === 'light') {
      switch(priority) {
        case 'Haute': return 'bg-red-100 text-red-700';
        case 'Moyenne': return 'bg-orange-100 text-orange-700';
        case 'Basse': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    } else {
      switch(priority) {
        case 'Haute': return 'bg-red-900 text-red-200';
        case 'Moyenne': return 'bg-orange-900 text-orange-200';
        case 'Basse': return 'bg-green-900 text-green-200';
        default: return 'bg-gray-800 text-gray-300';
      }
    }
  }
}