import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Sesion {
  dia: number; // 1-7 (Lun-Dom)
  inicio: string; // HH:mm
  fin: string;    // HH:mm
  asignatura: string;
  sala?: string;
}

@Component({
  selector: 'app-teacher-planner',
  templateUrl: './teacher-planner.page.html',
  styleUrls: ['./teacher-planner.page.scss']
})
export class TeacherPlannerPage {
  form: FormGroup;
  sesiones: Sesion[] = [];
  dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  conflictMsg = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dia: [1, Validators.required],
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
      asignatura: ['', [Validators.required, Validators.minLength(2)]],
      sala: ['']
    });
  }

  private toMinutes(hhmm: string): number {
    const [h,m] = hhmm.split(':').map(Number);
    return h*60 + m;
  }

  private seSolapan(a: Sesion, b: Sesion): boolean {
    if (a.dia !== b.dia) return false;
    const ai = this.toMinutes(a.inicio);
    const af = this.toMinutes(a.fin);
    const bi = this.toMinutes(b.inicio);
    const bf = this.toMinutes(b.fin);
    return ai < bf && bi < af; // intersección estricta
  }

  agregar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const nueva: Sesion = this.form.value;
    // Validación fin > inicio
    if (this.toMinutes(nueva.fin) <= this.toMinutes(nueva.inicio)) {
      this.conflictMsg = 'La hora de término debe ser posterior al inicio.';
      return;
    }
    // Conflictos
    const conflicto = this.sesiones.find(s => this.seSolapan(s, nueva));
    if (conflicto) {
      this.conflictMsg = `Conflicto con ${conflicto.asignatura} (${this.dias[conflicto.dia-1]} ${conflicto.inicio}-${conflicto.fin}).`;
      return;
    }
    this.conflictMsg = '';
    this.sesiones.push(nueva);
    this.form.reset({ dia: 1 });
  }

  eliminar(idx: number) { this.sesiones.splice(idx, 1); }

  guardar() {
    // TODO: Integrar API POST /Profesor/planificador (no disponible aún)
    console.log('Planificador guardado', this.sesiones);
  }
}
