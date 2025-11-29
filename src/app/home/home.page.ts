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

  ultimasNotas: any[] = [];

  // Mapa de colores por asignatura (con transparencia)
  private coloresAsignaturas: { [key: string]: string } = {
    'Matemáticas': 'rgba(59, 130, 246, 0.2)', // Azul
    'Lenguaje': 'rgba(239, 68, 68, 0.2)',     // Rojo
    'Ciencias': 'rgba(16, 185, 129, 0.2)',    // Verde
    'Historia': 'rgba(245, 158, 11, 0.2)',    // Amarillo
    'Inglés': 'rgba(139, 92, 246, 0.2)',      // Violeta
    'Artes': 'rgba(236, 72, 153, 0.2)',       // Rosa
    'Música': 'rgba(14, 165, 233, 0.2)',      // Celeste
    'Educación Física': 'rgba(249, 115, 22, 0.2)' // Naranja
  };

  // Color por defecto
  private colorDefault = 'rgba(107, 114, 128, 0.2)'; // Gris

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
        this.procesarUltimasNotas();
      },
      error: (err) => console.error('No se pudo cargar las inscripciones', err)
    });
  }

  procesarUltimasNotas() {
    let todasLasNotas: any[] = [];

    this.inscripciones.forEach(insc => {
      const nombreAsignatura = insc.asignatura?.nombre || 'Asignatura';
      const notas = insc.notas || [];

      if (Array.isArray(notas)) {
        notas.forEach((nota: any) => {
          // Normalizar objeto nota
          const valor = typeof nota === 'object' ? (nota.valor || nota.nota) : nota;
          // Si no hay fecha, usamos una fecha por defecto o la actual si es recién creada (simulado)
          // Aquí asumiremos que 'nota' puede tener fecha, o simulamos una para el ejemplo si no existe
          const fecha = typeof nota === 'object' && nota.fecha ? nota.fecha : new Date().toISOString();

          todasLasNotas.push({
            asignatura: nombreAsignatura,
            valor: Number(valor),
            fecha: fecha,
            color: this.obtenerColorAsignatura(nombreAsignatura),
            estado: this.obtenerEstadoNota(Number(valor))
          });
        });
      }
    });

    // Ordenar por fecha descendente (las más recientes primero)
    // Si las fechas son strings ISO, la comparación de strings funciona. Si no, convertir a Date.
    todasLasNotas.sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    // Tomar las últimas 4
    this.ultimasNotas = todasLasNotas.slice(0, 4);
  }

  obtenerColorAsignatura(nombre: string): string {
    // Busca coincidencia parcial o exacta
    const key = Object.keys(this.coloresAsignaturas).find(k => nombre.includes(k));
    return key ? this.coloresAsignaturas[key] : this.colorDefault;
  }

  obtenerEstadoNota(nota: number): { texto: string, color: string } {
    if (nota >= 6.0) return { texto: 'Excelente', color: 'success' };
    if (nota >= 4.0) return { texto: 'Aprobado', color: 'primary' }; // Primary o Success según preferencia
    return { texto: 'Requiere mejora', color: 'warning' };
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
}
