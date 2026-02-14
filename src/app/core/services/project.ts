import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Project, Task } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  
  // Mock data respecting the schema
  private projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Redesign company website with new branding',
      status: 'En cours',
      tasks: [
        {
          id: 101,
          title: 'Create wireframes',
          description: 'Design initial wireframes for homepage',
          priority: 'Haute',
          status: 'Terminé',
          dueDate: new Date('2026-02-01')
        },
        {
          id: 102,
          title: 'Develop frontend',
          description: 'Implement new design in Angular',
          priority: 'Haute',
          status: 'En cours',
          dueDate: new Date('2026-03-15')
        },
        {
          id: 103,
          title: 'Testing',
          description: 'Cross-browser testing',
          priority: 'Moyenne',
          status: 'En attente',
          dueDate: new Date('2026-03-30')
        }
      ],
      createdAt: new Date('2026-01-15')
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Create iOS and Android mobile app',
      status: 'En cours',
      tasks: [
        {
          id: 201,
          title: 'UI/UX Design',
          description: 'Design mobile app interfaces',
          priority: 'Haute',
          status: 'En cours',
          dueDate: new Date('2026-03-01')
        },
        {
          id: 202,
          title: 'API Development',
          description: 'Create RESTful APIs',
          priority: 'Haute',
          status: 'En attente',
          dueDate: new Date('2026-04-15')
        }
      ],
      createdAt: new Date('2026-02-01')
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate legacy database to cloud',
      status: 'Terminé',
      tasks: [
        {
          id: 301,
          title: 'Backup data',
          description: 'Create full database backup',
          priority: 'Haute',
          status: 'Terminé',
          dueDate: new Date('2025-12-15')
        },
        {
          id: 302,
          title: 'Migration script',
          description: 'Write migration scripts',
          priority: 'Haute',
          status: 'Terminé',
          dueDate: new Date('2026-01-30')
        }
      ],
      createdAt: new Date('2025-12-01')
    },
    {
      id: 4,
      name: 'Client Portal',
      description: 'Develop client portal for project management',
      status: 'En pause',
      tasks: [
        {
          id: 401,
          title: 'Requirements gathering',
          description: 'Meet with client to gather requirements',
          priority: 'Moyenne',
          status: 'Terminé',
          dueDate: new Date('2026-02-10')
        },
        {
          id: 402,
          title: 'Prototype',
          description: 'Create interactive prototype',
          priority: 'Basse',
          status: 'En attente',
          dueDate: new Date('2026-03-20')
        }
      ],
      createdAt: new Date('2026-02-05')
    }
  ];

  constructor() { }

  // ============= PROJECT METHODS =============
  
  // GET all projects
  getProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  // GET project by ID
  getProjectById(id: number): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    return of(project);
  }

  // ADD new project
  addProject(project: Project): Observable<Project> {
    const newId = Math.max(...this.projects.map(p => p.id || 0), 0) + 1;
    const newProject = { 
      ...project, 
      id: newId,
      createdAt: new Date(),
      tasks: project.tasks || [] 
    };
    this.projects.push(newProject);
    return of(newProject);
  }

  // UPDATE project
  updateProject(updatedProject: Project): Observable<Project> {
    const index = this.projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      this.projects[index] = updatedProject;
    }
    return of(updatedProject);
  }

  // DELETE project
  deleteProject(id: number): Observable<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // GET projects by status
  getProjectsByStatus(status: 'En cours' | 'Terminé' | 'En pause'): Observable<Project[]> {
    const filteredProjects = this.projects.filter(p => p.status === status);
    return of(filteredProjects);
  }

  // ============= TASK METHODS (Matching component calls) =============
  
  // ADD task to project - matches component's addTask()
  addTask(projectId: number, task: Task): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      const newTaskId = Math.max(...project.tasks.map(t => t.id || 0), 0) + 1;
      const newTask = { ...task, id: newTaskId };
      project.tasks.push(newTask);
    }
    return of(project);
  }

  // UPDATE task - matches component's updateTask()
  updateTask(projectId: number, updatedTask: Task): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      const taskIndex = project.tasks.findIndex(t => t.id === updatedTask.id);
      if (taskIndex !== -1) {
        project.tasks[taskIndex] = updatedTask;
      }
    }
    return of(project);
  }

  // DELETE task - matches component's deleteTask()
  deleteTask(projectId: number, taskId: number): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.tasks = project.tasks.filter(t => t.id !== taskId);
    }
    return of(project);
  }

  // ============= ADDITIONAL TASK METHODS =============
  
  // Get all tasks from a project
  getProjectTasks(projectId: number): Observable<Task[]> {
    const project = this.projects.find(p => p.id === projectId);
    return of(project?.tasks || []);
  }

  // Get tasks by status
  getTasksByStatus(projectId: number, status: 'En attente' | 'En cours' | 'Terminé'): Observable<Task[]> {
    const project = this.projects.find(p => p.id === projectId);
    const filteredTasks = project?.tasks.filter(t => t.status === status) || [];
    return of(filteredTasks);
  }

  // Get tasks by priority
  getTasksByPriority(projectId: number, priority: 'Haute' | 'Moyenne' | 'Basse'): Observable<Task[]> {
    const project = this.projects.find(p => p.id === projectId);
    const filteredTasks = project?.tasks.filter(t => t.priority === priority) || [];
    return of(filteredTasks);
  }

  // Update task status
  updateTaskStatus(projectId: number, taskId: number, status: 'En attente' | 'En cours' | 'Terminé'): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      const task = project.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = status;
      }
    }
    return of(project);
  }

  // ============= STATISTICS METHODS =============
  
  // GET project statistics
  getProjectStats(): Observable<any> {
    const stats = {
      total: this.projects.length,
      enCours: this.projects.filter(p => p.status === 'En cours').length,
      termine: this.projects.filter(p => p.status === 'Terminé').length,
      enPause: this.projects.filter(p => p.status === 'En pause').length,
      
      // Task statistics
      totalTasks: this.projects.reduce((sum, p) => sum + p.tasks.length, 0),
      tasksEnAttente: this.projects.reduce((sum, p) => 
        sum + p.tasks.filter(t => t.status === 'En attente').length, 0),
      tasksEnCours: this.projects.reduce((sum, p) => 
        sum + p.tasks.filter(t => t.status === 'En cours').length, 0),
      tasksTermine: this.projects.reduce((sum, p) => 
        sum + p.tasks.filter(t => t.status === 'Terminé').length, 0),
      
      // Priority statistics
      hautePriorite: this.projects.reduce((sum, p) => 
        sum + p.tasks.filter(t => t.priority === 'Haute').length, 0),
      moyennePriorite: this.projects.reduce((sum, p) => 
        sum + p.tasks.filter(t => t.priority === 'Moyenne').length, 0),
      bassePriorite: this.projects.reduce((sum, p) => 
        sum + p.tasks.filter(t => t.priority === 'Basse').length, 0)
    };
    return of(stats);
  }

  // Get project progress (percentage of completed tasks)
  getProjectProgress(projectId: number): Observable<number> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project || project.tasks.length === 0) return of(0);
    
    const completedTasks = project.tasks.filter(t => t.status === 'Terminé').length;
    const progress = Math.round((completedTasks / project.tasks.length) * 100);
    return of(progress);
  }

  // Get project completion percentage
  getProjectCompletion(projectId: number): Observable<number> {
    return this.getProjectProgress(projectId);
  }

  // ============= SEARCH METHODS =============
  
  // Search projects by name or description
  searchProjects(searchTerm: string): Observable<Project[]> {
    const term = searchTerm.toLowerCase();
    const results = this.projects.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    );
    return of(results);
  }

  // Search tasks across all projects
  searchTasks(searchTerm: string): Observable<Task[]> {
    const term = searchTerm.toLowerCase();
    const allTasks: Task[] = [];
    
    this.projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.title.toLowerCase().includes(term) || 
            (task.description && task.description.toLowerCase().includes(term))) {
          allTasks.push({ ...task, id: task.id });
        }
      });
    });
    
    return of(allTasks);
  }
}