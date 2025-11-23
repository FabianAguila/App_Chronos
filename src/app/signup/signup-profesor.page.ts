import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../servicios/api.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-signup-profesor',
  templateUrl: './signup-profesor.page.html',
  styleUrls: ['./signup-profesor.page.scss']
})
export class SignupProfesorPage {
  formRegis: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    this.formRegis = this.fb.group({
      nombreCompleto: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      especialidad: ['', Validators.required]
    });
  }

  async registrarProfesor() {
    if (this.formRegis.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos obligatorios',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const formValue = this.formRegis.value;
    const profesor = {
      Nom_prof: formValue.nombreCompleto,
      CorreoElectronico: formValue.correoElectronico?.trim(),
      Contrasena: formValue.contrasena?.trim()
    };

    try {
      await this.api.registrarProfesor(profesor).toPromise();
      const toast = await this.toastCtrl.create({
        message: 'Registro exitoso',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
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
