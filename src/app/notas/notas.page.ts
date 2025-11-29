import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.page.html',
  styleUrls: ['./notas.page.scss']
})
export class NotasPage implements OnInit {

  inscripciones: any[] = [];
  expandedAsignaturas: Set<number> = new Set();
  loading: boolean = true;

  constructor(private apiService: ApiService) { }

  async ngOnInit() {
    const res = await Preferences.get({ key: 'alumnoId' });
    const id = res.value;

    if (id && !isNaN(+id)) {
      this.cargarInscripciones(+id);
    } else {
      this.loading = false;
    }
  }

  cargarInscripciones(id: number) {
    this.apiService.getInscripcionAlumno(id).subscribe({
      next: (data) => {
        this.inscripciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando notas', err);
        this.loading = false;
      }
    });
  }

  toggleAsignatura(id: number) {
    if (this.expandedAsignaturas.has(id)) {
      this.expandedAsignaturas.delete(id);
    } else {
      this.expandedAsignaturas.add(id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedAsignaturas.has(id);
  }

  getPromedioAsignatura(insc: any): number {
    const notas = insc.notas || [];
    if (!notas.length) return 0;

    const suma = notas.reduce((acc: number, curr: any) => {
      const valor = typeof curr === 'object' ? (curr.valor || curr.nota || 0) : curr;
      return acc + Number(valor);
    }, 0);

    return suma / notas.length;
  }

  getEstadoAsignatura(promedio: number): { texto: string, color: string } {
    if (promedio >= 6.0) return { texto: 'Excelente', color: 'success' };
    if (promedio >= 4.0) return { texto: 'Aprobado', color: 'success' };
    return { texto: 'Requiere Mejora', color: 'warning' };
  }

  get promedioGeneral(): number {
    if (!this.inscripciones.length) return 0;

    let sumaPromedios = 0;
    let count = 0;

    this.inscripciones.forEach(insc => {
      const notas = insc.notas || [];
      if (notas.length > 0) {
        sumaPromedios += this.getPromedioAsignatura(insc);
        count++;
      }
    });

    return count > 0 ? sumaPromedios / count : 0;
  }

  get aprobadas(): number {
    return this.inscripciones.filter(insc => {
      const notas = insc.notas || [];
      if (notas.length === 0) return false;
      return this.getPromedioAsignatura(insc) >= 4.0;
    }).length;
  }

  getProgreso(promedio: number): number {
    const pct = (promedio / 7) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  fmt(n: number): string {
    return n.toFixed(1);
  }
}