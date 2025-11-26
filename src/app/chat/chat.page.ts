import { Component } from '@angular/core';

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
  chats: ChatItem[] = [
    { id: 1, nombre: 'Profesor García', mensaje: 'Sí, podemos revisarlo mañana', hora: '10:30 AM', unread: 2 },
    { id: 2, nombre: 'Profesora Rodríguez', mensaje: 'Recuerden enviar la tarea antes del', hora: 'Ayer' },
    { id: 3, nombre: 'Profesor Martínez', mensaje: 'El examen será la próxima', hora: 'Martes' },
    { id: 4, nombre: 'Orientadora Pérez', mensaje: 'Claro, agendemos una reunión', hora: '12/03/24' },
  ];

  get filtered() {
    const q = this.query.toLowerCase();
    return this.chats.filter(c => c.nombre.toLowerCase().includes(q) || c.mensaje.toLowerCase().includes(q));
  }
}