import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { take } from 'rxjs/operators';
import { ApiService } from '../servicios/api.service';
import { ToastController } from '@ionic/angular';

interface ChatItem {
  id: number;
  nombre: string;
  mensaje: string;
  hora: string;
  avatar?: string;
  unread?: number;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage {
  query = '';
  chats: ChatItem[] = [];
  isProfesor = false;

  constructor(private router: Router, private api: ApiService, private toastCtrl: ToastController) {
    this.initChats();
  }

  private async initChats() {
    const { value: rol } = await Preferences.get({ key: 'rol' });
    this.isProfesor = rol === 'profesor';

    if (this.isProfesor) {
      // Lista de alumnos para el profesor (ejemplo estático, reemplazar por API)
      this.chats = [
        { id: 101, nombre: 'Alumno Juan Pérez', mensaje: 'Profe, ¿puede revisar mi nota?', hora: '10:30 AM', unread: 1 },
        { id: 102, nombre: 'Alumno María López', mensaje: '¿Hay guías disponibles?', hora: 'Ayer' },
      ];
    } else {
      // Intentar cargar profesores reales desde el backend
      this.api.getProfesores().pipe(take(1)).subscribe({
        next: (list) => {
          console.log('getProfesores response:', list);
          const mapped: any[] = [];
          for (const p of (list || [])) {
            // Construir nombre preferente: nombre completo > nom_prof > nombres+apellidos > correo local-part
            const correoLocal = p?.correoElectronico ? String(p.correoElectronico).split('@')[0] : '';
            const rawName = (
              p?.nombreCompleto ??
              p?.nombre ??
              p?.nom_prof ??
              (p?.nombres ? `${p.nombres} ${p.apellidos}` : undefined) ??
              correoLocal ??
              ''
            ).toString().trim();

            const initials = (rawName || `P${p.id}`)
              .split(' ')
              .filter(Boolean)
              .map((s: string) => s[0].toString().toUpperCase())
              .slice(0, 2)
              .join('');

            // Filtrar entradas sin datos reales: si no hay nombre ni correo ni avatar ni nom_prof/nombres
            const hasRealData = Boolean(rawName) || Boolean(p?.correoElectronico) || Boolean(p?.avatar) || Boolean(p?.nom_prof) || Boolean(p?.nombres);
            if (!hasRealData) {
              // saltar este registro
              continue;
            }

            // Asegurar prefijo 'Profesor' cuando corresponde (vista del alumno)
            let displayName = rawName || `Profesor ${p.id}`;
            const titleRegex = /^(profesor|profesora|orientador|orientadora)/i;
            if (!titleRegex.test(displayName)) {
              displayName = `Profesor ${displayName}`;
            }

            mapped.push({
              id: p.id,
              nombre: displayName,
              mensaje: p.ultimoMensaje ?? p.ultimo_mensaje ?? '',
              hora: p.ultimaHora ?? p.ultima_hora ?? '',
              avatar: p.avatarUrl ?? p.avatar ?? '',
              initials
            });
          }

          // Asignar la lista tal cual; si viene vacía, mostraremos un estado vacío en la UI
          this.chats = mapped;
        },
        error: async (err) => {
          console.warn('No se pudo cargar profesores', err);
          const t = await this.toastCtrl.create({ message: 'No se pudo cargar profesores desde el servidor.', duration: 2500 });
          await t.present();
          // mantener lista vacía — UI mostrará estado vacío
        }
      });
    }
  }

  // Abre la conversación correcta según el rol y el id del item
  async openChat(c: ChatItem) {
    const { value: rol } = await Preferences.get({ key: 'rol' });
    const isProfesor = rol === 'profesor';

    // Si es profesor, asumimos que `c.id` es alumnoId; si es alumno, `c.id` es profesorId.
    const idToOpen = c.id;
    await this.router.navigate(['/chat-room', idToOpen]);
  }

  get filtered() {
    const q = this.query.toLowerCase();
    return this.chats.filter(c => c.nombre.toLowerCase().includes(q) || c.mensaje.toLowerCase().includes(q));
  }
}