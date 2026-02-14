import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../../core/services/project';
import { Project, Task } from '../../../../core/models/project.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./project-list.css'],
})
export class ProjectListComponent implements OnInit {
  // Data arrays
  projects: Project[] = [];
  filteredProjects: Project[] = [];

  // UI States
  loading = true;
  error = '';

  // Modal states
  showProjectModal = false;
  showTaskModal = false;
  showDeleteConfirmModal = false;

  // Editing states
  editingProject: Project | null = null;
  editingTask: Task | null = null;
  selectedProjectId: number | null = null;

  // Delete confirmation
  itemToDelete: { type: 'project' | 'task'; id: number; projectId?: number } | null = null;

  // Forms
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

  // Filters
  filterStatus: string = 'Tous';
  searchTerm: string = '';

  // Statistics
  stats: any = {};

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadStats();
  }

  // ============= LOADING DATA =============
  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (data: any) => {
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

  // ============= FILTERS =============
  applyFilters(): void {
    let filtered = [...this.projects];

    // Filter by status
    if (this.filterStatus !== 'Tous') {
      filtered = filtered.filter((p) => p.status === this.filterStatus);
    }

    // Filter by search term
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

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  // ============= PROJECT CRUD =============
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
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editingProject) {
      // Update existing project
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
      // Add new project
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
      next: (success: any) => {
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

  // ============= TASK CRUD =============
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
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editingTask && this.selectedProjectId) {
      // Update existing task
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
      // Add new task
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

  // ============= TASK STATUS MANAGEMENT =============
  updateTaskStatus(
    projectId: number,
    task: Task,
    newStatus: 'En attente' | 'En cours' | 'Terminé',
  ): void {
    const updatedTask = { ...task, status: newStatus };
    this.projectService.updateTask(projectId, updatedTask).subscribe({
      next: () => {
        this.loadProjects();
      },
      error: (err: any) => {
        this.error = 'Échec de la mise à jour du statut';
        console.error(err);
      },
    });
  }

  getTaskStatusClass(status: string): string {
    switch (status) {
      case 'En attente':
        return 'status-pending';
      case 'En cours':
        return 'status-in-progress';
      case 'Terminé':
        return 'status-completed';
      default:
        return '';
    }
  }

  // ============= DELETE CONFIRMATION =============
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

  // ============= UTILITY METHODS =============
  getProjectProgress(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((t) => t.status === 'Terminé').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Haute':
        return 'priority-high';
      case 'Moyenne':
        return 'priority-medium';
      case 'Basse':
        return 'priority-low';
      default:
        return '';
    }
  }

  editTask(projectId: number, task: any) {
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
}
