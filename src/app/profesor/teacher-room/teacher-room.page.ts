import { Component } from '@angular/core';

@Component({
  selector: 'app-teacher-room',
  templateUrl: './teacher-room.page.html',
  styleUrls: ['./teacher-room.page.scss']
})
export class TeacherRoomPage {
  sala = { id: 'B12', capacidad: 32, ubicacion: 'Edificio B, 2° piso', recursos: ['Proyector', 'Audio', 'Pizarra'] };
}
