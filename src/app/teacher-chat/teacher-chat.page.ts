import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ApiService } from '../servicios/api.service';
import { ToastController } from '@ionic/angular';
import { take } from 'rxjs/operators';

interface AlumnoItem { id: number; nombre: string; mensaje?: string; hora?: string; }

@Component({
  selector: 'app-teacher-chat',
  templateUrl: './teacher-chat.page.html',
  styleUrls: ['./teacher-chat.page.scss'],
})
export class TeacherChatPage implements OnInit {
  alumnos: AlumnoItem[] = [];
  profesorId: number | null = null;

  constructor(private router: Router, private api: ApiService, private toastCtrl: ToastController) {}

  async ngOnInit() {
    const { value } = await Preferences.get({ key: 'profesorId' });
    this.profesorId = value ? Number(value) : null;

    // Intentamos cargar los alumnos reales del profesor
    if (this.profesorId) {
      this.api.getAlumnosProfesor(this.profesorId).pipe(take(1)).subscribe({
        next: (lista) => {
          this.alumnos = lista.map((a: any) => ({ id: a.id, nombre: a.nombreCompleto ?? a.nombre ?? `${a.nombres} ${a.apellidos}`, mensaje: a.ultimoMensaje ?? '', hora: a.ultimaHora ?? '' }));
        },
        error: async (err) => {
          console.warn('No se pudo obtener alumnos por profesor, intentando cargar todos los alumnos', err);
          // Fallback: cargar todos los alumnos registrados
          this.api.getAlumnos().pipe(take(1)).subscribe({
            next: (all) => {
              this.alumnos = all.map((a: any) => ({ id: a.id, nombre: a.nombreCompleto ?? a.nombre ?? `${a.nombres} ${a.apellidos}`, mensaje: '', hora: '' }));
            },
            error: async (err2) => {
              console.error('No se pudo cargar lista de alumnos', err2);
              const t = await this.toastCtrl.create({ message: 'No se pudo cargar la lista de alumnos.', duration: 2000 });
              await t.present();
              // Mantener lista vacía
            }
          });
        }
      });
    } else {
      // Si no hay profesorId, dejar lista vacía y mostrar mensaje en UI
      this.alumnos = [];
    }
  }

  openConversation(alumno: AlumnoItem) {
    // Navega a chat-room pasando el alumnoId; `chat-room` interpreta el id según rol
    this.router.navigate(['/chat-room', alumno.id]);
  }

  // Cargar todos los alumnos registrados (para agregar a la lista del profesor)
  mostrarTodos() {
    this.api.getAlumnos().pipe(take(1)).subscribe({
      next: (all) => {
        this.alumnos = all.map((a: any) => ({ id: a.id, nombre: a.nombreCompleto ?? a.nombre ?? `${a.nombres} ${a.apellidos}`, mensaje: '', hora: '' }));
      },
      error: async (err) => {
        console.error('Error cargando todos los alumnos', err);
        const t = await this.toastCtrl.create({ message: 'No se pudo cargar los alumnos registrados.', duration: 2000 });
        await t.present();
      }
    });
  }
}
