import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ApiService } from '../servicios/api.service';
import { ToastController, AlertController } from '@ionic/angular';
import { take } from 'rxjs/operators';

type Remitente = 'profesor' | 'alumno';

interface Mensaje {
  de: Remitente;
  texto: string;
  hora: string;
}

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {
  // El id pasado por la ruta puede ser profesorId o alumnoId dependiendo del rol
  conversationPartnerId!: number;
  conversationPartnerName = '';
  profesorId: number | null = null;
  alumnoId: number | null = null;
  mensajes: Mensaje[] = [];
  mensajeNuevo = '';
  privadoRemitente: Remitente = 'alumno';
  isProfesor = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const paramId = Number(this.route.snapshot.paramMap.get('id'));

    // Obtener rol e ids guardados para decidir cómo interpretar el param
    Preferences.get({ key: 'rol' }).then(async ({ value }) => {
      const rol = value;

      // nombres de ejemplo (temporal)
      const nombresProfesores: Record<number, string> = {
        1: 'Profesor García',
        2: 'Profesora Rodríguez',
        3: 'Profesor Martínez',
        4: 'Orientadora Pérez',
      };
      const nombresAlumnos: Record<number, string> = {
        101: 'Alumno Juan Pérez',
        102: 'Alumno María López',
        103: 'Alumno Ana Gómez',
      };

      if (rol === 'profesor') {
        this.isProfesor = true;
        // como profesor, el param es alumnoId
        this.alumnoId = paramId;
        const { value: pid } = await Preferences.get({ key: 'profesorId' });
        this.profesorId = pid ? Number(pid) : null;
        this.conversationPartnerId = this.alumnoId!;
        this.conversationPartnerName = nombresAlumnos[this.conversationPartnerId] || 'Alumno';
        this.privadoRemitente = 'profesor';

        // Intentar obtener el nombre real del alumno desde el backend y reemplazar si existe
        if (this.alumnoId) {
          this.api.getAlumnoPorId(this.alumnoId).pipe(take(1)).subscribe({
            next: (a: any) => {
              if (a) {
                const name = a.nombreCompleto ?? a.nombre ?? (a.nombres ? `${a.nombres} ${a.apellidos}` : undefined) ?? '';
                if (name && name.trim().length) this.conversationPartnerName = name;
              }
            },
            error: (e) => {
              console.warn('No se pudo obtener detalle del alumno', e);
            }
          });
        }
      } else {
        this.isProfesor = false;
        // como alumno, el param es profesorId
        this.profesorId = paramId;
        const { value: aid } = await Preferences.get({ key: 'alumnoId' });
        this.alumnoId = aid ? Number(aid) : null;
        this.conversationPartnerId = this.profesorId!;
        // Asegurar prefijo 'Profesor' en la vista del alumno
        const rawProfName = nombresProfesores[this.conversationPartnerId] || 'Profesor';
        const titleRegex = /^(profesor|profesora|orientador|orientadora)/i;
        this.conversationPartnerName = titleRegex.test(rawProfName) ? rawProfName : `Profesor ${rawProfName}`;
        this.privadoRemitente = 'alumno';

        // Intentar obtener el nombre real del profesor desde el backend y reemplazar si existe
        if (this.profesorId) {
          this.api.getProfesor(this.profesorId).pipe(take(1)).subscribe({
            next: (p: any) => {
              if (p) {
                const name = p.nombreCompleto ?? p.nombre ?? p.nom_prof ?? (p.nombres ? `${p.nombres} ${p.apellidos}` : undefined) ?? (p.correoElectronico ? String(p.correoElectronico).split('@')[0] : '');
                if (name && String(name).trim().length) {
                  const titleRegexInner = /^(profesor|profesora|orientador|orientadora)/i;
                  this.conversationPartnerName = titleRegexInner.test(name) ? name : `Profesor ${name}`;
                }
              }
            },
            error: (e) => {
              console.warn('No se pudo obtener detalle del profesor', e);
            }
          });
        }
      }

      // Debug: mostrar rol e ids en consola
      console.log('ChatRoom init — rol:', rol, 'paramId:', paramId, 'profesorId:', this.profesorId, 'alumnoId:', this.alumnoId);

      // Inicialmente no hay mensajes locales (se cargarán desde backend si existen)
      this.mensajes = [];

      // Si tenemos ambos ids, cargar la conversación real desde el backend
      if (this.profesorId && this.alumnoId) {
        this.api
          .getConversacion(this.profesorId, this.alumnoId)
          .pipe(take(1))
          .subscribe({
            next: (msgs) => {
              // Esperamos que msgs venga como array de { remitente: 'profesor'|'alumno', texto, fecha }
              this.mensajes = (msgs || []).map((m: any) => ({ de: m.remitente as Remitente, texto: m.texto, hora: m.fecha || m.hora || '' }));
            },
            error: async (err) => {
              // Si el backend responde 404, intentamos la ruta invertida (por si el backend espera alumno/profesor)
              if (err && err.status === 404) {
                // reintento con parametros invertidos
                this.api.getConversacion(this.alumnoId!, this.profesorId!).pipe(take(1)).subscribe({
                  next: (msgs2) => {
                    this.mensajes = (msgs2 || []).map((m: any) => ({ de: m.remitente as Remitente, texto: m.texto, hora: m.fecha || m.hora || '' }));
                  },
                  error: async (err2) => {
                    // Si tampoco existe con el orden invertido, tratamos como conversación vacía
                    if (err2 && err2.status === 404) {
                      this.mensajes = [];
                      const t = await this.toastCtrl.create({ message: 'No hay mensajes aún.', duration: 1500 });
                      await t.present();
                      return;
                    }
                    // Otro error en el segundo intento
                    console.error('Error cargando conversacion (reintento)', err2);
                    const t = await this.toastCtrl.create({ message: 'No se pudo cargar la conversación.', duration: 2000 });
                    await t.present();
                  }
                });
                return;
              }
              // Otros errores distintos de 404
              console.error('Error cargando conversacion', err);
              const t = await this.toastCtrl.create({ message: 'No se pudo cargar la conversación.', duration: 2000 });
              await t.present();
            },
          });
      }
    });
  }
  enviar() {
    const texto = this.mensajeNuevo.trim();
    if (!texto) {
      return;
    }
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Preparar payload para enviar al backend
    const payload = {
      profesorId: this.profesorId,
      alumnoId: this.alumnoId,
      remitente: this.privadoRemitente,
      texto,
    };

    // Limpia input inmediatamente
    this.mensajeNuevo = '';

    // Mostrar mensaje provisional en UI para feedback (optimista)
    this.mensajes.push({ de: this.privadoRemitente, texto, hora });

    // Enviar al backend
    console.log('Enviando mensaje payload:', payload, 'a', this.api);
    this.api.enviarMensaje(payload).pipe(take(1)).subscribe({
      next: (saved) => {
        // Si backend devuelve el mensaje guardado con fecha/id, podríamos reemplazar o actualizar.
        // Por simplicidad, si viene texto y fecha, actualizamos la última burbuja.
        if (saved && (saved.texto || saved.fecha)) {
          const lastIdx = this.mensajes.length - 1;
          this.mensajes[lastIdx] = { de: saved.remitente ?? this.privadoRemitente, texto: saved.texto ?? texto, hora: saved.fecha ?? hora };
        }
      },
      error: async (err) => {
        console.error('Error enviando mensaje', err);
        // Mostrar detalles básicos para depuración
        const status = err?.status ?? 'unknown';
        const url = err?.url ?? '';
        let msg = 'No se pudo enviar el mensaje.';
        if (status === 404) {
          msg = `Endpoint no encontrado (404): ${url}`;
        } else if (status) {
          msg = `Error ${status} al enviar mensaje`;
        }
        const toast = await this.toastCtrl.create({ message: msg, duration: 4000 });
        await toast.present();
      },
    });
  }

  // Navega hacia la página correcta según el rol (profesor -> teacher-chat, alumno -> chat)
  async volver() {
    const { value: rol } = await Preferences.get({ key: 'rol' });
    if (rol === 'profesor') {
      this.router.navigateByUrl('/teacher-chat');
    } else {
      this.router.navigateByUrl('/chat');
    }
  }

  // Mostrar prompt para agregar nota (solo profesor)
  async presentAgregarNota() {
    const alert = await this.alertCtrl.create({
      header: 'Agregar nota',
      inputs: [
        {
          name: 'valor',
          type: 'number',
          attributes: { step: '0.1', min: '1', max: '7' },
          placeholder: 'Valor (1.0 - 7.0)'
        },
        { name: 'descripcion', type: 'text', placeholder: 'Descripción (opcional)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: async (data) => {
            const v = parseFloat(data.valor);
            if (isNaN(v) || v < 1 || v > 7) {
              const t = await this.toastCtrl.create({ message: 'Ingrese una nota válida entre 1.0 y 7.0', duration: 2000 });
              await t.present();
              return false; // evita cerrar si querés que el usuario corrija
            }
            const payload = {
              profesorId: this.profesorId,
              alumnoId: this.alumnoId,
              valor: v,
              descripcion: data.descripcion || '',
              fecha: new Date().toISOString()
            };
            this.api.agregarNotaAlumno(payload).pipe(take(1)).subscribe({
              next: async (res) => {
                const t = await this.toastCtrl.create({ message: 'Nota agregada', duration: 1500 });
                await t.present();
              },
              error: async (err) => {
                console.error('Error agregando nota', err);
                const t = await this.toastCtrl.create({ message: 'No se pudo agregar la nota', duration: 2000 });
                await t.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Mostrar prompt para marcar asistencia (solo profesor)
  async presentMarcarAsistencia() {
    const alert = await this.alertCtrl.create({
      header: 'Marcar asistencia',
      inputs: [
        { name: 'presente', type: 'radio', label: 'Presente', value: 'true', checked: true },
        { name: 'presente', type: 'radio', label: 'Ausente', value: 'false' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: async (value) => {
            const presente = value === 'true';
            const payload = {
              profesorId: this.profesorId,
              alumnoId: this.alumnoId,
              fecha: new Date().toISOString(),
              presente
            };
            this.api.marcarAsistenciaAlumno(payload).pipe(take(1)).subscribe({
              next: async () => {
                const t = await this.toastCtrl.create({ message: 'Asistencia registrada', duration: 1500 });
                await t.present();
              },
              error: async (err) => {
                console.error('Error registrando asistencia', err);
                const t = await this.toastCtrl.create({ message: 'No se pudo registrar asistencia', duration: 2000 });
                await t.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
