import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service';
import { finalize, take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

interface LoginResponse {
  id: number;
  nombreUsuario: string;
  correoElectronico?: string;
  profesorId?: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  formLogin: FormGroup;
  loading = false;
  loginError = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) {
    this.formLogin = this.fb.group({
      correo: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });
  }

  ngOnInit() {}

  async ingresar() {
    this.loginError = false;

    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor completa todos los campos correctamente.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    const correoForm = (this.formLogin.value.correo as string).trim().toLowerCase();
    const contraseña = (this.formLogin.value.password as string);

    this.loading = true;

    this.apiService
      .iniciarSesion({ correoElectronico: correoForm, contraseña })
      .pipe(take(1), finalize(() => (this.loading = false)))
      .subscribe({
        next: async (res: LoginResponse) => {
          // Guarda datos base
          await Preferences.set({ key: 'alumnoId', value: String(res.id) });
          await Preferences.set({ key: 'nombreUsuario', value: res?.nombreUsuario ?? '' });

          // Determina correo efectivo (API o form) y rol
          const correo = (res.correoElectronico ?? correoForm).toLowerCase().trim();
          const isProfesor = correo.endsWith('@profesor.duocuc.cl');
          const isAdmin = (res?.nombreUsuario ?? '').toLowerCase().includes('admin');

          // Persiste rol y profesorId si aplica
          await Preferences.set({ key: 'rol', value: isProfesor ? 'profesor' : 'alumno' });
          if (isProfesor && typeof res.profesorId === 'number') {
            await Preferences.set({ key: 'profesorId', value: String(res.profesorId) });
          } else {
            // Limpia profesorId si no corresponde
            await Preferences.remove({ key: 'profesorId' });
          }

          // Routing según rol
          if (isAdmin) {
            this.router.navigate(['/admin']);
          } else if (isProfesor) {
            this.router.navigate(['/teacher-home']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: async (err: unknown) => {
          this.loginError = true;

          let message = 'Correo o contraseña incorrectos.';
          if (err instanceof HttpErrorResponse) {
            if (err.status === 0) message = 'No hay conexión con el servidor.';
            else if (err.status >= 500) message = 'Error interno del servidor.';
            else if (err.status === 401) message = 'Credenciales inválidas.';
            else if (typeof err.error === 'string') message = err.error;
          }

          const alert = await this.alertController.create({
            header: 'Error',
            message,
            buttons: ['Aceptar'],
          });
          await alert.present();
        },
      });
  }

  redirectToSignup() {
    this.router.navigate(['/signup']);
  }
}
