import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  profesorId!: number;
  profesorNombre = '';
  mensajes: Mensaje[] = [];
  mensajeNuevo = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.profesorId = Number(this.route.snapshot.paramMap.get('id'));
    const nombres: Record<number, string> = {
      1: 'Profesor García',
      2: 'Profesora Rodríguez',
      3: 'Profesor Martínez',
      4: 'Orientadora Pérez',
    };
    this.profesorNombre = nombres[this.profesorId] || 'Profesor';

    // Mensajes de ejemplo iniciales
    this.mensajes = [
      {
        de: 'profesor',
        texto: `Hola, soy ${this.profesorNombre}. ¿En qué puedo ayudarte?`,
        hora: '10:00',
      },
      {
        de: 'alumno',
        texto: 'Profe, tengo una duda sobre la guía.',
        hora: '10:01',
      },
    ];
  }

  enviar() {
    const texto = this.mensajeNuevo.trim();
    if (!texto) {
      return;
    }
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.mensajes.push({
      de: 'alumno',
      texto,
      hora,
    });

    this.mensajeNuevo = '';
  }
}
