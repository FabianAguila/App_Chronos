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

    const correoForm = (this.formLogin.value.correo as string).trim();
    const contraseña = (this.formLogin.value.password as string).trim();

    // Determina si parece un profesor por el dominio antes de llamar al API
    const looksLikeProfesor = correoForm.toLowerCase().endsWith('@profesor.duocuc.cl');

    console.log('🔐 Intentando login con:', { 
      CorreoElectronico: correoForm, 
      Contrasena: '***' + contraseña.substring(Math.max(0, contraseña.length - 2))
    });

    this.loading = true;

    // Enviar con PascalCase como espera el backend .NET
    const loginPayload = { CorreoElectronico: correoForm, Contrasena: contraseña };

    // Llamar al endpoint correspondiente según el dominio del correo
    const loginObservable = looksLikeProfesor
      ? this.apiService.iniciarSesionProfesor(loginPayload)
      : this.apiService.iniciarSesion(loginPayload);

    loginObservable
      .pipe(take(1), finalize(() => (this.loading = false)))
      .subscribe({
        next: async (res: LoginResponse) => {
          console.log('✅ Login exitoso, respuesta:', res);
          
          // Determina correo efectivo (API o form) y rol PRIMERO
          const correo = (res.correoElectronico ?? correoForm).toLowerCase().trim();
          const isProfesor = correo.endsWith('@profesor.duocuc.cl');
          const isAdmin = (res?.nombreUsuario ?? '').toLowerCase().includes('admin');

          console.log('📧 Correo:', correo, '| Profesor:', isProfesor, '| Admin:', isAdmin);

          // Guarda datos base (no asuma que el id es de alumno)
          await Preferences.set({ key: 'nombreUsuario', value: res?.nombreUsuario ?? '' });

          // Guardar objeto usuario para compatibilidad con AutenticacionService
          await Preferences.set({
            key: 'usuario',
            value: JSON.stringify({ id: res.id, nombreUsuario: res?.nombreUsuario ?? '', correoElectronico: correo }),
          });

          // Persiste rol y los ids correctos según rol
          await Preferences.set({ key: 'rol', value: isProfesor ? 'profesor' : 'alumno' });
          if (isProfesor) {
            // Si el backend devuelve un profesorId úsalo; si no, usa el id general
            const profesorIdToStore = typeof res.profesorId === 'number' ? res.profesorId : res.id;
            await Preferences.set({ key: 'profesorId', value: String(profesorIdToStore) });
            await Preferences.remove({ key: 'alumnoId' });
          } else {
            await Preferences.set({ key: 'alumnoId', value: String(res.id) });
            await Preferences.remove({ key: 'profesorId' });
          }

          console.log('💾 Preferences guardadas. Navegando...');

          // Routing según rol con replaceUrl para evitar volver al login
          if (isAdmin) {
            await this.router.navigate(['/admin'], { replaceUrl: true });
          } else if (isProfesor) {
            await this.router.navigate(['/teacher-home'], { replaceUrl: true });
          } else {
            await this.router.navigate(['/home'], { replaceUrl: true });
          }

          console.log('🚀 Navegación completada');
        },
        error: async (err: unknown) => {
          this.loginError = true;
          console.error('❌ Error en login:', err);

          let message = 'Correo o contraseña incorrectos.';
          if (err instanceof HttpErrorResponse) {
            console.error('📛 Status HTTP:', err.status, '| Body:', err.error);
            if (err.status === 0) message = 'No hay conexión con el servidor.';
            else if (err.status >= 500) message = 'Error interno del servidor.';
            else if (err.status === 401) message = 'Credenciales inválidas. Verifica tu correo y contraseña.';
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
