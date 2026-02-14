import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskComponent {
  @Input() task: any;
  @Input() projectId!: number;
  @Output() taskUpdated = new EventEmitter<any>();
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskStatusChanged = new EventEmitter<any>();

  isEditing = false;
  editedTask: any = {};

  getStatusClass(status: string): string {
    switch(status) {
      case 'En attente': return 'border-l-yellow-500 bg-yellow-50';
      case 'En cours': return 'border-l-blue-500 bg-blue-50';
      case 'Terminé': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  }

  getPriorityClass(priority: string): string {
    switch(priority) {
      case 'Haute': return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-orange-100 text-orange-800';
      case 'Basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'En attente': return '⏳';
      case 'En cours': return '🔄';
      case 'Terminé': return '✅';
      default: return '📋';
    }
  }

  startEdit() {
    this.isEditing = true;
    this.editedTask = { ...this.task };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedTask = {};
  }

  saveEdit() {
    this.taskUpdated.emit({ ...this.editedTask, id: this.task.id });
    this.isEditing = false;
  }

  onStatusChange(newStatus: string) {
    this.taskStatusChanged.emit({ ...this.task, status: newStatus });
  }

  deleteTask() {
    this.taskDeleted.emit(this.task.id);
  }
}