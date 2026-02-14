// src/app/core/models/project.model.ts
export interface Task {
  id?: number;
  title: string;
  description?: string;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  status: 'En attente' | 'En cours' | 'Terminé';
  dueDate?: Date;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  status: 'En cours' | 'Terminé' | 'En pause';
  tasks: Task[];
  createdAt?: Date;
}