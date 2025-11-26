import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherHomePage } from './teacher-home.page';
// import { AutenticacionGuard } from '../servicios/autenticacion.guard'; // opcional

const routes: Routes = [
  {
    path: '',
    component: TeacherHomePage,
    // canActivate: [AutenticacionGuard], // opcional si quieres proteger esta página
    data: { title: 'Dashboard Profesor' }
  },
  {
    path: 'planificador',
    loadChildren: () => import('./teacher-planner/teacher-planner.module').then(m => m.TeacherPlannerModule)
  },
  {
    path: 'curso/:id/nota',
    loadChildren: () => import('./teacher-grades/teacher-grades.module').then(m => m.TeacherGradesModule)
  },
  {
    path: 'curso/:id/asistencia',
    loadChildren: () => import('./teacher-attendance/teacher-attendance.module').then(m => m.TeacherAttendanceModule)
  },
  {
    path: 'sala/:id',
    loadChildren: () => import('./teacher-room/teacher-room.module').then(m => m.TeacherRoomModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherRoutingModule {}
