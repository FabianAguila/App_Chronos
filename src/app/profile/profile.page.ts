import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ApiService } from '../servicios/api.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    profileForm: FormGroup;
    alumno: any = null;
    loading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController
    ) {
        this.profileForm = this.fb.group({
            nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            comuna: ['', Validators.required],
            rut: [{ value: '', disabled: true }],
            id: [{ value: '', disabled: true }]
        });
    }

    async ngOnInit() {
        await this.loadUserData();
    }

    async loadUserData() {
        try {
            const res = await Preferences.get({ key: 'alumnoId' });
            if (res.value) {
                const alumnoId = parseInt(res.value, 10);
                this.apiService.getAlumno(alumnoId).subscribe({
                    next: (data) => {
                        this.alumno = data;
                        this.profileForm.patchValue({
                            nombreCompleto: data.nombreCompleto || '',
                            email: data.email || '',
                            comuna: data.comuna || '',
                            rut: data.rut || '',
                            id: data.id || ''
                        });
                    },
                    error: (err) => {
                        console.error('Error loading user data:', err);
                        this.showAlert('Error', 'No se pudo cargar la información del perfil');
                    }
                });
            }
        } catch (error) {
            console.error('Error reading preferences:', error);
        }
    }

    async saveProfile() {
        if (this.profileForm.invalid) {
            this.showAlert('Error', 'Por favor completa todos los campos correctamente');
            return;
        }

        const loading = await this.loadingCtrl.create({
            message: 'Guardando cambios...'
        });
        await loading.present();

        try {
            const updatedData = {
                ...this.alumno,
                nombreCompleto: this.profileForm.value.nombreCompleto,
                email: this.profileForm.value.email,
                comuna: this.profileForm.value.comuna
            };

            this.apiService.updateAlumno(this.alumno.id, updatedData).subscribe({
                next: async () => {
                    await loading.dismiss();
                    this.showAlert('Éxito', 'Perfil actualizado correctamente');
                    this.alumno = updatedData;
                },
                error: async (err) => {
                    await loading.dismiss();
                    console.error('Error updating profile:', err);
                    this.showAlert('Error', 'No se pudo actualizar el perfil');
                }
            });
        } catch (error) {
            await loading.dismiss();
            console.error('Error:', error);
            this.showAlert('Error', 'Ocurrió un error inesperado');
        }
    }

    async cerrarSesion() {
        const alert = await this.alertCtrl.create({
            header: 'Cerrar Sesión',
            message: '¿Estás seguro de que deseas cerrar sesión?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Cerrar Sesión',
                    role: 'destructive',
                    handler: async () => {
                        await Preferences.remove({ key: 'alumnoId' });
                        await Preferences.remove({ key: 'isLoggedIn' });
                        this.router.navigate(['/login']);
                    }
                }
            ]
        });
        await alert.present();
    }

    async showAlert(header: string, message: string) {
        const alert = await this.alertCtrl.create({
            header,
            message,
            buttons: ['OK']
        });
        await alert.present();
    }

    goBack() {
        this.router.navigate(['/home']);
    }
}
