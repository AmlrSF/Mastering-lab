import { Component, OnInit, inject } from '@angular/core';
import { ProjectService } from '../../../../core/services/project';
import { ThemeService } from '../../../../core/services/theme';
import { Project, Task } from '../../../../core/models/project.model';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
  trigger, transition, style, animate, query, stagger, keyframes 
} from '@angular/animations';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
          style({ transform: 'translateX(0)',    offset: 0   }),
          style({ transform: 'translateX(-10px)', offset: 0.1 }),
          style({ transform: 'translateX(10px)',  offset: 0.2 }),
          style({ transform: 'translateX(-10px)', offset: 0.3 }),
          style({ transform: 'translateX(10px)',  offset: 0.4 }),
          style({ transform: 'translateX(-5px)',  offset: 0.5 }),
          style({ transform: 'translateX(5px)',   offset: 0.6 }),
          style({ transform: 'translateX(-2px)',  offset: 0.7 }),
          style({ transform: 'translateX(2px)',   offset: 0.8 }),
          style({ transform: 'translateX(0)',     offset: 1   })
        ]))
      ])
    ])
  ]
})
export class ProjectListComponent implements OnInit {

  // ── Data ────────────────────────────────────────────────────────
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  stats: any = {};

  // ── UI state ────────────────────────────────────────────────────
  loading = true;
  error = '';
  filterStatus = 'Tous';
  searchTerm = '';
  animatedItemId: any = null;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null = null;

  // ── Modal state ─────────────────────────────────────────────────
  showProjectModal = false;
  showTaskModal = false;
  showDeleteConfirmModal = false;
  showDetailsModal = false;

  editingProject: Project | null = null;
  editingTask: Task | null = null;
  selectedProjectId: number | null = null;
  selectedProject: Project | null = null;
  itemToDelete: { type: 'project' | 'task'; id: number; projectId?: number } | null = null;

  // ── Reactive Forms ──────────────────────────────────────────────
  projectModalForm!: FormGroup;
  taskModalForm!: FormGroup;

  // ── Services ────────────────────────────────────────────────────
  private themeService = inject(ThemeService);
  currentTheme = this.themeService.theme;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {}

  // ══════════════════════════════════════════════════════════════════
  // Lifecycle
  // ══════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    this.buildProjectForm();
    this.buildTaskForm();
    this.loadProjects();
    this.loadStats();
    this.projectService.notifications$.subscribe(n => this.notification = n);
  }

  // ══════════════════════════════════════════════════════════════════
  // Form builders
  // ══════════════════════════════════════════════════════════════════

  private buildProjectForm(): void {
    this.projectModalForm = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      status:      ['En cours', Validators.required]
    });
  }

  private buildTaskForm(): void {
    this.taskModalForm = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      priority:    ['Moyenne', Validators.required],
      status:      ['En attente', Validators.required],
      dueDate:     [null]
    });
  }

  // ── Getters: project form ───────────────────────────────────────
  get pName()        { return this.projectModalForm.get('name'); }
  get pDescription() { return this.projectModalForm.get('description'); }
  get pStatus()      { return this.projectModalForm.get('status'); }

  // ── Getters: task form ──────────────────────────────────────────
  get tTitle()       { return this.taskModalForm.get('title'); }
  get tDescription() { return this.taskModalForm.get('description'); }
  get tPriority()    { return this.taskModalForm.get('priority'); }
  get tStatus()      { return this.taskModalForm.get('status'); }
  get tDueDate()     { return this.taskModalForm.get('dueDate'); }

  // ══════════════════════════════════════════════════════════════════
  // Validation helpers
  // ══════════════════════════════════════════════════════════════════

  getFieldError(control: any, fieldLabel: string): string {
    if (!control || !control.touched || !control.invalid) return '';
    if (control.hasError('required'))  return `${fieldLabel} est obligatoire.`;
    if (control.hasError('minlength')) return `Minimum ${control.errors?.['minlength'].requiredLength} caractères.`;
    if (control.hasError('maxlength')) return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères.`;
    return 'Champ invalide.';
  }

  getControlClass(control: any): string {
    if (!control || control.pristine) return '';
    return control.invalid
      ? 'border-red-500 ring-1 ring-red-400'
      : 'border-green-500';
  }

  // ══════════════════════════════════════════════════════════════════
  // Data loading
  // ══════════════════════════════════════════════════════════════════

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
      }
    });
  }

  loadStats(): void {
    this.projectService.getProjectStats().subscribe((stats: any) => {
      this.stats = stats;
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // Filtering & search
  // ══════════════════════════════════════════════════════════════════

  applyFilters(): void {
    let filtered = [...this.projects];
    if (this.filterStatus !== 'Tous') {
      filtered = filtered.filter(p => p.status === this.filterStatus);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
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

  // ══════════════════════════════════════════════════════════════════
  // Project modal
  // ══════════════════════════════════════════════════════════════════

  openAddProjectModal(): void {
    this.editingProject = null;
    this.projectModalForm.reset({ status: 'En cours' });
    this.showProjectModal = true;
  }

  openEditProjectModal(project: Project): void {
    this.editingProject = project;
    this.projectModalForm.patchValue({
      name:        project.name,
      description: project.description,
      status:      project.status
    });
    this.projectModalForm.markAsPristine();
    this.showProjectModal = true;
  }

  closeProjectModal(): void {
    this.showProjectModal = false;
    this.editingProject = null;
    this.projectModalForm.reset({ status: 'En cours' });
  }

  saveProject(): void {
    if (this.projectModalForm.invalid) {
      this.projectModalForm.markAllAsTouched();
      this.projectService.showNotification('Veuillez corriger les erreurs du formulaire.', 'error');
      return;
    }

    const v = this.projectModalForm.value;

    if (this.editingProject) {
      const updated: Project = { ...this.editingProject, ...v };
      this.projectService.updateProject(updated).subscribe({
        next: () => { this.closeProjectModal(); this.loadProjects(); this.loadStats(); },
        error: (err: any) => { this.error = 'Échec de la mise à jour du projet'; console.error(err); }
      });
    } else {
      const newProject: Project = {
        name:        v.name,
        description: v.description,
        status:      v.status,
        tasks:       []
      };
      this.projectService.addProject(newProject).subscribe({
        next: () => { this.closeProjectModal(); this.loadProjects(); this.loadStats(); },
        error: (err: any) => { this.error = "Échec de l'ajout du projet"; console.error(err); }
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Task modal
  // ══════════════════════════════════════════════════════════════════

  openAddTaskModal(projectId: number): void {
    this.selectedProjectId = projectId;
    this.editingTask = null;
    this.taskModalForm.reset({ priority: 'Moyenne', status: 'En attente' });
    this.showTaskModal = true;
  }

  editTask(projectId: number, task: Task): void {
    this.selectedProjectId = projectId;
    this.editingTask = task;
    this.taskModalForm.patchValue({
      title:       task.title,
      description: task.description || '',
      priority:    task.priority,
      status:      task.status,
      dueDate:     task.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : null
    });
    this.taskModalForm.markAsPristine();
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
    this.selectedProjectId = null;
    this.taskModalForm.reset({ priority: 'Moyenne', status: 'En attente' });
  }

  saveTask(): void {
    if (this.taskModalForm.invalid) {
      this.taskModalForm.markAllAsTouched();
      this.projectService.showNotification('Veuillez corriger les erreurs du formulaire.', 'error');
      return;
    }
    if (!this.selectedProjectId) return;

    const v = this.taskModalForm.value;

    if (this.editingTask) {
      const updated: Task = { ...this.editingTask, ...v };
      this.projectService.updateTask(this.selectedProjectId, updated).subscribe({
        next: () => { this.closeTaskModal(); this.loadProjects(); },
        error: (err: any) => { this.error = 'Échec de la mise à jour de la tâche'; console.error(err); }
      });
    } else {
      const newTask: Task = {
        title:       v.title,
        description: v.description || '',
        priority:    v.priority,
        status:      v.status,
        dueDate:     v.dueDate ? new Date(v.dueDate) : undefined
      };
      this.projectService.addTask(this.selectedProjectId, newTask).subscribe({
        next: () => { this.closeTaskModal(); this.loadProjects(); },
        error: (err: any) => { this.error = "Échec de l'ajout de la tâche"; console.error(err); }
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Delete flow
  // ══════════════════════════════════════════════════════════════════

  confirmDeleteProject(id: number): void {
    this.itemToDelete = { type: 'project', id };
    this.showDeleteConfirmModal = true;
  }

  confirmDeleteTask(projectId: number, taskId: number): void {
    this.itemToDelete = { type: 'task', id: taskId, projectId };
    this.showDeleteConfirmModal = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete?.type === 'project') {
      this.deleteProject(this.itemToDelete.id);
    } else if (this.itemToDelete?.type === 'task' && this.itemToDelete.projectId) {
      this.deleteTask(this.itemToDelete.projectId, this.itemToDelete.id);
    }
  }

  cancelDelete(): void {
    this.itemToDelete = null;
    this.showDeleteConfirmModal = false;
  }

  deleteProject(id: number): void {
    this.projectService.deleteProject(id).subscribe({
      next: (success: boolean) => {
        if (success) { this.loadProjects(); this.loadStats(); this.cancelDelete(); }
      },
      error: (err: any) => { this.error = 'Échec de la suppression du projet'; console.error(err); }
    });
  }

  deleteTask(projectId: number, taskId: number): void {
    this.projectService.deleteTask(projectId, taskId).subscribe({
      next: () => { this.loadProjects(); this.cancelDelete(); },
      error: (err: any) => { this.error = 'Échec de la suppression de la tâche'; console.error(err); }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // Task status quick-change
  // ══════════════════════════════════════════════════════════════════

  updateTaskStatus(projectId: number, task: Task, newStatus: 'En attente' | 'En cours' | 'Terminé'): void {
    this.animatedItemId = task.id;
    const updated = { ...task, status: newStatus };
    this.projectService.updateTask(projectId, updated).subscribe({
      next: () => {
        this.loadProjects();
        setTimeout(() => this.animatedItemId = null, 500);
      },
      error: (err: any) => { this.error = 'Échec de la mise à jour du statut'; console.error(err); }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // Details modal
  // ══════════════════════════════════════════════════════════════════

  openProjectDetailsModal(projectId: number): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project) { this.selectedProject = project; this.showDetailsModal = true; }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProject = null;
  }

  // ══════════════════════════════════════════════════════════════════
  // Utility / computed
  // ══════════════════════════════════════════════════════════════════

  getProjectProgress(project: Project): number {
    return this.projectService.getProjectProgressSync(project);
  }

  countTasksByStatus(project: Project, status: string): number {
    return project.tasks?.filter(t => t.status === status).length || 0;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // Theme & style helpers
  // ══════════════════════════════════════════════════════════════════

  getNotificationClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500'
    };
    return map[type] ?? 'bg-gray-500';
  }

  getInputClass(): string {
    return this.currentTheme() === 'light'
      ? 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
      : 'border-gray-600 bg-dark-200 text-gray-100 focus:ring-blue-400';
  }

  getButtonClass(type: 'primary' | 'secondary' | 'danger'): string {
    const light: Record<string, string> = {
      primary:   'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      danger:    'bg-red-600 hover:bg-red-700 text-white'
    };
    const dark: Record<string, string> = {
      primary:   'bg-blue-500 hover:bg-blue-600 text-white',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
      danger:    'bg-red-500 hover:bg-red-600 text-white'
    };
    return (this.currentTheme() === 'light' ? light : dark)[type] ?? '';
  }

  getStatusBadgeClass(status: string): string {
    const light: Record<string, string> = {
      'En cours': 'bg-yellow-100 text-yellow-800',
      'Terminé':  'bg-green-100 text-green-800',
      'En pause': 'bg-gray-100 text-gray-800'
    };
    const dark: Record<string, string> = {
      'En cours': 'bg-yellow-900 text-yellow-200',
      'Terminé':  'bg-green-900 text-green-200',
      'En pause': 'bg-gray-800 text-gray-300'
    };
    return (this.currentTheme() === 'light' ? light : dark)[status] ?? '';
  }

  getTaskStatusClass(status: string): string {
    const light: Record<string, string> = {
      'En attente': 'border-l-yellow-500 bg-yellow-50',
      'En cours':   'border-l-blue-500 bg-blue-50',
      'Terminé':    'border-l-green-500 bg-green-50'
    };
    const dark: Record<string, string> = {
      'En attente': 'border-l-yellow-500 bg-yellow-900/20',
      'En cours':   'border-l-blue-500 bg-blue-900/20',
      'Terminé':    'border-l-green-500 bg-green-900/20'
    };
    return (this.currentTheme() === 'light' ? light : dark)[status] ?? 'border-l-gray-500 bg-gray-50';
  }

  getPriorityClass(priority: string): string {
    const light: Record<string, string> = {
      'Haute':   'bg-red-100 text-red-700',
      'Moyenne': 'bg-orange-100 text-orange-700',
      'Basse':   'bg-green-100 text-green-700'
    };
    const dark: Record<string, string> = {
      'Haute':   'bg-red-900 text-red-200',
      'Moyenne': 'bg-orange-900 text-orange-200',
      'Basse':   'bg-green-900 text-green-200'
    };
    return (this.currentTheme() === 'light' ? light : dark)[priority] ?? 'bg-gray-100 text-gray-700';
  }
}