import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskComponent implements OnInit, OnChanges {
  @Input() task: any;
  @Input() projectId!: number;
  @Output() taskUpdated = new EventEmitter<any>();
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskStatusChanged = new EventEmitter<any>();

  isEditing = false;
  editForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(): void {
    if (this.editForm) {
      this.editForm.patchValue(this.task || {});
    }
  }

  private buildForm(): void {
    this.editForm = this.fb.group({
      title: [
        this.task?.title || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ]
      ],
      description: [
        this.task?.description || '',
        [Validators.maxLength(500)]
      ],
      priority: [
        this.task?.priority || 'Moyenne',
        Validators.required
      ],
      status: [
        this.task?.status || 'En attente',
        Validators.required
      ]
    });
  }

  // ── Getters for clean template access ──────────────────────
  get title()       { return this.editForm.get('title'); }
  get description() { return this.editForm.get('description'); }
  get priority()    { return this.editForm.get('priority'); }
  get status()      { return this.editForm.get('status'); }

  // ── Error helpers ───────────────────────────────────────────
  getTitleError(): string {
    if (this.title?.hasError('required'))   return 'Le titre est obligatoire.';
    if (this.title?.hasError('minlength'))  return 'Minimum 3 caractères.';
    if (this.title?.hasError('maxlength'))  return 'Maximum 100 caractères.';
    return '';
  }

  getDescriptionError(): string {
    if (this.description?.hasError('maxlength')) return 'Maximum 500 caractères.';
    return '';
  }

  // ── Styling helpers ─────────────────────────────────────────
  getStatusClass(status: string): string {
    switch (status) {
      case 'En attente': return 'border-l-yellow-500 bg-yellow-50';
      case 'En cours':   return 'border-l-blue-500 bg-blue-50';
      case 'Terminé':    return 'border-l-green-500 bg-green-50';
      default:           return 'border-l-gray-500 bg-gray-50';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Haute':   return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-orange-100 text-orange-800';
      case 'Basse':   return 'bg-green-100 text-green-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'En attente': return '⏳';
      case 'En cours':   return '🔄';
      case 'Terminé':    return '✅';
      default:           return '📋';
    }
  }

  inputClass(control: any): string {
    if (!control || control.pristine) return 'border-gray-300';
    return control.invalid ? 'border-red-500 ring-1 ring-red-400' : 'border-green-500';
  }

  // ── Actions ─────────────────────────────────────────────────
  startEdit(): void {
    this.isEditing = true;
    this.editForm.patchValue({
      title:       this.task.title,
      description: this.task.description || '',
      priority:    this.task.priority,
      status:      this.task.status
    });
    this.editForm.markAsPristine();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.taskUpdated.emit({ ...this.editForm.value, id: this.task.id });
    this.isEditing = false;
  }

  onStatusChange(newStatus: string): void {
    this.taskStatusChanged.emit({ ...this.task, status: newStatus });
  }

  deleteTask(): void {
    this.taskDeleted.emit(this.task.id);
  }
}