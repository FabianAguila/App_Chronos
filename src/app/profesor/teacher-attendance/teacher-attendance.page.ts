import { Component } from '@angular/core';

interface AlumnoRow { id: number; nombre: string; estado: 'P'|'A'|'J'; }

@Component({
  selector: 'app-teacher-attendance',
  templateUrl: './teacher-attendance.page.html',
  styleUrls: ['./teacher-attendance.page.scss']
})
export class TeacherAttendancePage {
  fecha = new Date().toISOString();
  cursoNombre = 'Curso';
  alumnos: AlumnoRow[] = [
    { id: 1, nombre: 'Ana Torres', estado: 'P' },
    { id: 2, nombre: 'Juan Pérez', estado: 'P' },
    { id: 3, nombre: 'María López', estado: 'A' },
  ];

  setEstado(a: AlumnoRow, e: any) {
    const val = e?.detail?.value as AlumnoRow['estado'];
    if (val) a.estado = val;
  }

  guardar() {
    // TODO: Integrar POST /Profesor/curso/{id}/asistencia
    console.log('Asistencia', this.fecha, this.alumnos);
  }
}
