import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage implements OnInit {
  scannedResult: string = '';
  hasCameras: boolean = true;
  esAdmin: boolean = false;

  constructor(
    private apiService: ApiService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.detectarCamara();
    await this.verificarRol();
  }

  async verificarRol() {
  const { value } = await Preferences.get({ key: 'nombreUsuario' });
  this.esAdmin = value?.toLowerCase().includes('admin') ?? false;
}


  async detectarCamara() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    this.hasCameras = videoDevices.length > 0;
  }

  async reintentarDeteccion() {
    await this.detectarCamara();
    const toast = await this.toastCtrl.create({
      message: this.hasCameras ? '🎥 Cámara detectada' : '❌ No se encontró cámara',
      duration: 2000,
      color: this.hasCameras ? 'success' : 'warning'
    });
    toast.present();
  }

  async onCodeResult(result: string) {
    this.scannedResult = result;

    try {
      const qrData = JSON.parse(result);

      if (!this.esAdmin) {
        const toast = await this.toastCtrl.create({
          message: 'Solo los administradores pueden registrar asistencia',
          duration: 2000,
          color: 'warning'
        });
        toast.present();
        return;
      }

      const payload = {
        alumnoId: qrData.id,
        asignaturaId: qrData.asignaturaId,
        salaId: qrData.salaId
      };
      
      const nombreRes = await Preferences.get({ key: 'nombreUsuario' });
      const nombreUsuario = nombreRes.value || '';

      this.apiService.registrarAsistencia(payload, nombreUsuario).subscribe({
        next: async () => {
          const toast = await this.toastCtrl.create({
            message: '✅ Asistencia registrada',
            duration: 2000,
            color: 'success'
          });
          toast.present();
        },
        error: async () => {
          const toast = await this.toastCtrl.create({
            message: '❌ Error al registrar asistencia',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      });

    } catch {
      const toast = await this.toastCtrl.create({
        message: '⚠️ QR inválido',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
    }
  }
}
