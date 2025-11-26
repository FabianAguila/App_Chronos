// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/servicios/autenticacion.guard';
import { ProfesorGuard } from './servicios/profesor.guard';

const routes: Routes = [
  // público
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'forgotpass', loadChildren: () => import('./forgotpass/forgotpass.module').then(m => m.ForgotpassPageModule) },
  { path: 'signup', loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule) },
  { path: 'signup-profesor', loadChildren: () => import('./signup/signup-profesor.module').then(m => m.SignupProfesorModule) },

  // protegido (alumno)
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AutenticacionGuard],
    canLoad: [AutenticacionGuard],
  },
  {
    path: 'scanner',
    loadChildren: () => import('./scanner/scanner.module').then(m => m.ScannerPageModule),
    canActivate: [AutenticacionGuard],
    canLoad: [AutenticacionGuard],
  },
  {
    path: 'inscripcion',
    loadChildren: () => import('./inscripcion/inscripcion.module').then(m => m.InscripcionPageModule),
    canActivate: [AutenticacionGuard],
    canLoad: [AutenticacionGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./administracion/admin.module').then(m => m.AdminPageModule),
    canActivate: [AutenticacionGuard],
    canLoad: [AutenticacionGuard],
  },

  // protegido (profesor)
  {
    path: 'teacher-home',
    loadChildren: () => import('./profesor/teacher.module').then(m => m.TeacherModule),
    canActivate: [ProfesorGuard],
    canLoad: [ProfesorGuard],
  },

  // pantalla exclusiva para profesores: lista de conversaciones con alumnos
  {
    path: 'teacher-chat',
    loadChildren: () => import('./teacher-chat/teacher-chat.module').then(m => m.TeacherChatPageModule),
    canActivate: [ProfesorGuard],
    canLoad: [ProfesorGuard],
  },

  // nuevas páginas (deben ir antes del comodín)
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatPageModule),
  },
  {
    path: 'chat-room/:id',
    loadChildren: () => import('./chat-room/chat-room.module').then(m => m.ChatRoomPageModule),
    canActivate: [AutenticacionGuard],
    canLoad: [AutenticacionGuard],
  },
  {
    path: 'notas',
    loadChildren: () => import('./notas/notas.module').then(m => m.NotasPageModule),
  },
  {
    path: 'asistencia',
    loadChildren: () => import('./asistencia/asistencia.module').then(m => m.AsistenciaPageModule),
  },

  // raíz & 404
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'noencontrado', loadChildren: () => import('./noencontrado/noencontrado.module').then(m => m.NoencontradoPageModule) },
  { path: '**', redirectTo: 'noencontrado', pathMatch: 'full' },  // SIEMPRE AL FINAL
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
