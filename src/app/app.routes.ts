import { Routes } from '@angular/router';
import { ProjectListComponent } from './features/projects/components/project-list/project-list';
import { EmailListComponent } from './features/projects/components/reactiveform/reactiveform';


export const routes: Routes = [
  {
    path: '',
     component: ProjectListComponent
  },
  {
    path: 'form',
    component:EmailListComponent
  }
];