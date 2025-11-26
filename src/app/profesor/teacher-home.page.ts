// src/app/teacher-home/teacher-home.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ApiService } from '../servicios/api.service';
import { take } from 'rxjs/operators';

interface ProfesorDto { id: number; nom_prof: string; }
interface CursoCardDto { id: number; nombre: string; alumnos: number; imagen?: string | null; grado?: number | null; }
interface TeacherDashboardDto { totalCursos: number; totalAlumnos: number; asistenciasHoy: number; notasHoy: number; }

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.page.html',
  styleUrls: ['./teacher-home.page.scss']
})
export class TeacherHomePage implements OnInit {
  perfil: { nombre: string; avatar?: string } = { nombre: '' };
  cursos: CursoCardDto[] = [];
  metrics?: TeacherDashboardDto;
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  abrirChat() {
    // Navegación dependiente del rol: si es profesor, abrir su pantalla de chat exclusiva
    Preferences.get({ key: 'rol' }).then(({ value }) => {
      if (value === 'profesor') this.router.navigate(['/teacher-chat']);
      else this.router.navigate(['/chat']);
    });
  }

  async ngOnInit() {
    this.loading = true;

    // 1) Lee el profesorId que guardaste en login (ajusta la key si usas otra)
    const { value } = await Preferences.get({ key: 'profesorId' });
    const profesorId = value ? Number(value) : null;

    if (!profesorId || Number.isNaN(profesorId)) {
      // Si no hay profesorId, redirige o muestra mensaje
      this.router.navigate(['/login']);
      return;
    }

    // 2) Carga perfil, cursos y métricas
    this.api.getProfesor(profesorId).pipe(take(1))
      .subscribe(p => this.perfil = { nombre: (p as ProfesorDto).nom_prof, avatar: '' });

    this.api.getCursosProfesor(profesorId).pipe(take(1))
      .subscribe(c => this.cursos = c as CursoCardDto[]);

    this.api.getDashboardProfesor(profesorId).pipe(take(1))
      .subscribe(d => this.metrics = d as TeacherDashboardDto);

    this.loading = false;
  }

  goPlanificador() { this.router.navigate(['/teacher-home/planificador']); }
  goNotas(curso: CursoCardDto) { this.router.navigate([`/teacher-home/curso/${curso.id}/nota`]); }
  goAsistencia(curso: CursoCardDto) { this.router.navigate([`/teacher-home/curso/${curso.id}/asistencia`]); }
  goSala(curso: CursoCardDto) { this.router.navigate([`/teacher-home/sala/${curso.id}`]); }

  async cerrarSesion() {
    await Preferences.clear();
    this.router.navigate(['/login']);
  }
}
