import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface AlumnoRow {
  id: number; nombre: string; nota?: number;
}

@Component({
  selector: 'app-teacher-grades',
  templateUrl: './teacher-grades.page.html',
  styleUrls: ['./teacher-grades.page.scss']
})
export class TeacherGradesPage {
  cursoNombre = 'Curso';
  alumnos: AlumnoRow[] = [
    { id: 1, nombre: 'Ana Torres', nota: 6.2 },
    { id: 2, nombre: 'Juan Pérez', nota: 5.1 },
    { id: 3, nombre: 'María López' },
  ];

  constructor(private fb: FormBuilder) {}

  setNota(a: AlumnoRow, value: any) {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    a.nota = Math.max(1, Math.min(7, n));
  }

  guardar() {
    // TODO: Integrar API POST /Profesor/curso/{id}/notas
    console.log('Notas guardadas', this.alumnos);
  }
}
