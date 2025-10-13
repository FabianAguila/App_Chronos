
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../servicios/api.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
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
      contraseña: ['', Validators.required],
      usaVehiculo: [false],
      matricula: [''],
      descripcionVehiculo: ['']
    });
  }

  toggleVehiculo() {
    if (!this.formRegis.get('usaVehiculo')?.value) {
      this.formRegis.patchValue({
        matricula: '',
        descripcionVehiculo: ''
      });
    }
  }

  async registrarAlumno() {
    const alumno = this.formRegis.value;

    try {
      await this.api.registrarAlumno(alumno).toPromise();

      const toast = await this.toastCtrl.create({
        message: 'Registro exitoso',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al registrar',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      console.error(error);
    }
  }
}
