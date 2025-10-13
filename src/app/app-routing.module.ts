import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/servicios/autenticacion.guard';
import { ProfesorGuard } from './servicios/profesor.guard';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },

  // público
  { path: 'forgotpass', loadChildren: () => import('./forgotpass/forgotpass.module').then(m => m.ForgotpassPageModule) },
  { path: 'signup', loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule) },

  // protegido
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AutenticacionGuard],
    canLoad: [AutenticacionGuard],  // ó canMatch en Angular 15+
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
  {
  path: 'teacher-home',
  loadChildren: () => import('./profesor/teacher.module').then(m => m.TeacherModule),
  canActivate: [ProfesorGuard],
  canLoad: [ProfesorGuard],
  },



  // raíz & 404
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'noencontrado', loadChildren: () => import('./noencontrado/noencontrado.module').then(m => m.NoencontradoPageModule) },
  { path: '**', redirectTo: 'noencontrado', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
