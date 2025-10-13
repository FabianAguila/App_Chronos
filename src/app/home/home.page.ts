import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ApiService } from '../servicios/api.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  alumno: any = null;
  inscripciones: any[] = [];
  asistenciaRegistradaHoy: boolean = false;
  qrData: string = '';
  accordionState: boolean[] = [];

  // control de acordeón
  expandedAsignaturas: Set<number> = new Set();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
  const res = await Preferences.get({ key: 'alumnoId' });
  const id = res.value;

  if (id && !isNaN(+id)) {
  const alumnoId = +id;
  this.cargarDatosAlumno(alumnoId);
  this.verificarAsistenciaHoy(alumnoId);
  this.cargarInscripcionesAlumno(alumnoId);
}

}

  cargarDatosAlumno(id: number) {
    this.apiService.getAlumnoCompleto(id).subscribe({
      next: (data) => {
        this.alumno = data;
        this.qrData = JSON.stringify({
          id: data.id,
          nombreCompleto: data.nombreCompleto,
          rut: data.rut,
          correo: data.correoElectronico,
          timestamp: new Date().toISOString()
        });
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al obtener datos completos del alumno', err)
    });
  }

cargarInscripcionesAlumno(id: number) {
  if (!id) return;

  this.apiService.getInscripcionAlumno(id).subscribe({
    next: (inscripciones) => {
      this.inscripciones = inscripciones;
      this.accordionState = inscripciones.map(() => false);
    },
    error: (err) => console.error('No se pudo cargar las inscripciones', err)
  });
}


  toggleAsignatura(asignaturaId: number) {
    if (this.expandedAsignaturas.has(asignaturaId)) {
      this.expandedAsignaturas.delete(asignaturaId);
    } else {
      this.expandedAsignaturas.add(asignaturaId);
    }
  }

  verificarAsistenciaHoy(id: number) {
    this.apiService.asistenciaRegistradaHoy(id).subscribe({
      next: (res) => { this.asistenciaRegistradaHoy = res.registradaHoy; },
      error: (err) => console.error('Error al verificar asistencia de hoy', err)
    });
  }

  async irAInscripcion() {
    this.router.navigate(['/inscripcion']);
  }

  async eliminarInscripcion(inscripcionId: number) {
    const confirm = await this.alertCtrl.create({
      header: '¿Eliminar inscripción?',
      message: 'Esto eliminará la asignatura, profesor y sala asignada.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.eliminarInscripcion(inscripcionId).subscribe({
              next: () => {
              this.cargarInscripcionesAlumno(this.alumno.id);
              },
            error: (err) => {
              console.error("Error eliminando la inscripcion")
            }
            });
          }
        }
      ]
    });
    await confirm.present();
  }
}
