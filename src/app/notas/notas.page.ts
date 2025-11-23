import { Component } from '@angular/core';

interface Materia {
  id: number;
  nombre: string;
  promedio: number;
  estado: 'Aprobado' | 'Excelente' | 'Requiere Mejora';
  icon: string;
}

@Component({
  selector: 'app-notas',
  templateUrl: './notas.page.html',
  styleUrls: ['./notas.page.scss']
})
export class NotasPage {
  materias: Materia[] = [
    // Ejemplos dentro de escala 1.0 - 7.0 para evitar barras fuera de rango
    { id: 1, nombre: 'Matemáticas', promedio: 6.5, estado: 'Aprobado', icon: 'document-text-outline' },
    { id: 2, nombre: 'Ciencias Naturales', promedio: 7.0, estado: 'Aprobado', icon: 'flask-outline' },
    { id: 3, nombre: 'Historia', promedio: 5.8, estado: 'Aprobado', icon: 'globe-outline' },
    { id: 4, nombre: 'Lenguaje', promedio: 4.2, estado: 'Requiere Mejora', icon: 'newspaper-outline' },
  ];

  color(estado: Materia['estado']) {
    return estado === 'Excelente' ? 'success' : estado === 'Aprobado' ? 'success' : 'warning';
  }

  get promedioGeneral(): number {
    if (!this.materias.length) return 0;
    return this.materias.reduce((s, m) => s + m.promedio, 0) / this.materias.length;
  }

  get aprobadas(): number {
    return this.materias.filter(m => m.estado !== 'Requiere Mejora').length;
  }

  // Retorna el porcentaje de avance (0-100) clamped
  getProgreso(m: Materia): number {
    const pct = (m.promedio / 7) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  // Formatea a 1 decimal y respeta el rango 1.0 - 7.0
  fmt(n: number): string {
    const v = Math.max(1, Math.min(7, n));
    return v.toFixed(1);
  }
}