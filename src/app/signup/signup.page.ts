
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../servicios/api.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  formRegis: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    this.formRegis = this.fb.group({
      nombreCompleto: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      rut: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  async registrarAlumno() {
    if (this.formRegis.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos obligatorios',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Transformar a PascalCase para el backend .NET
    const formValue = this.formRegis.value;

    // Asegurar formato de fecha correcto
    let fechaNacimiento = formValue.fechaNacimiento;
    if (fechaNacimiento && typeof fechaNacimiento === 'string') {
      // ion-datetime devuelve ISO string, asegurar que esté bien formateado
      fechaNacimiento = new Date(fechaNacimiento).toISOString();
    }

    const alumno = {
      NombreCompleto: formValue.nombreCompleto,
      FechaNacimiento: fechaNacimiento,
      Rut: formValue.rut,
      CorreoElectronico: formValue.correoElectronico?.trim(),
      Contrasena: formValue.contrasena?.trim()
    };

    console.log('📝 Registrando alumno:', { ...alumno, Contrasena: '***' });

    try {
      await this.api.registrarAlumno(alumno).toPromise();
      console.log('✅ Registro exitoso');

      const toast = await this.toastCtrl.create({
        message: 'Registro exitoso',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      console.error('❌ Error al registrar:', error);

      let mensaje = 'Error al registrar';
      if (error && typeof error === 'object' && 'error' in error) {
        const err = error as any;
        if (typeof err.error === 'string') {
          mensaje = err.error;
        } else if (err.status === 409) {
          mensaje = 'El correo ya está registrado';
        }
      }

      const toast = await this.toastCtrl.create({
        message: mensaje,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
