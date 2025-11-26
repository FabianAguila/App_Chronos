// ...existing code...
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
  promedioGeneral: string = '0.0';
  cantidadRamos: number = 0;

  // control de acordeón
  expandedAsignaturas: Set<number> = new Set();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private cd: ChangeDetectorRef
  ) { }

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
        this.cantidadRamos = inscripciones.length;
        this.accordionState = inscripciones.map(() => false);
        this.calcularPromedioGeneral();
      },
      error: (err) => console.error('No se pudo cargar las inscripciones', err)
    });
  }

  calcularPromedioGeneral() {
    if (!this.inscripciones || this.inscripciones.length === 0) {
      this.promedioGeneral = '0.0';
      return;
    }

    let sumaPromedios = 0;
    let asignaturasConNotas = 0;

    this.inscripciones.forEach((insc: any) => {
      // Se asume que cada inscripción tiene una propiedad 'notas' que es un array
      // Ajusta 'valor' o 'nota' según la estructura real de tu backend
      const notas = insc.notas || [];

      if (Array.isArray(notas) && notas.length > 0) {
        const sumaNotas = notas.reduce((acc: number, curr: any) => {
          // Intenta obtener el valor numérico de la nota
          const valor = typeof curr === 'object' ? (curr.valor || curr.nota || 0) : curr;
          return acc + Number(valor);
        }, 0);

        const promedioAsignatura = sumaNotas / notas.length;
        sumaPromedios += promedioAsignatura;
        asignaturasConNotas++;
      }
    });

    if (asignaturasConNotas > 0) {
      this.promedioGeneral = (sumaPromedios / asignaturasConNotas).toFixed(1);
    } else {
      this.promedioGeneral = '0.0';
    }
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

  async cerrarSesion() {
    await Preferences.clear();
    this.router.navigate(['/login']);
  }
}
