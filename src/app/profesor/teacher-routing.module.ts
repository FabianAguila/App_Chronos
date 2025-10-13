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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherRoutingModule {}
