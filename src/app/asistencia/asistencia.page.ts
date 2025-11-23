import { Component } from '@angular/core';

type Estado = 'P' | 'A' | 'J' | 'S'; // Presente, Ausente, Justificado, Sin registrar

interface Dia {
  fecha: Date;
  estado?: Estado;
}

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss']
})
export class AsistenciaPage {

  hoy = new Date();
  mes = this.hoy.getMonth();
  anio = this.hoy.getFullYear();
  semanas: Dia[][] = [];

  legend = [
    { color: 'var(--ion-color-success)', label: 'Presente' },
    { color: 'var(--ion-color-danger)', label: 'Ausente' },
    { color: '#a3e635', label: 'Justificado' },
    { color: '#e5e7eb', label: 'Sin registrar' },
  ];

  ngOnInit() {
    this.generarMes(this.anio, this.mes);
  }

  generarMes(y: number, m: number) {
    const first = new Date(y, m, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // lunes

    const semanas: Dia[][] = [];
    let cursor = new Date(start);
    for (let w = 0; w < 6; w++) {
      const fila: Dia[] = [];
      for (let d = 0; d < 7; d++) {
        fila.push({ fecha: new Date(cursor) });
        cursor.setDate(cursor.getDate() + 1);
      }
      semanas.push(fila);
    }
    // Simula estados
    for (const fila of semanas) for (const dia of fila) {
      if (dia.fecha.getMonth() === m) {
        const r = Math.random();
        dia.estado = r > 0.8 ? 'A' : r > 0.6 ? 'J' : r > 0.5 ? 'S' : 'P';
      }
    }
    this.semanas = semanas;
  }

  nombreMes(m: number) {
    return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m];
  }

  cambiarMes(delta: number) {
    let m = this.mes + delta;
    let y = this.anio;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    this.mes = m; this.anio = y;
    this.generarMes(this.anio, this.mes);
  }

  get presentes(): number {
    return this.semanas.flat().filter(d => d.estado === 'P').length;
  }
  get ausentes(): number {
    return this.semanas.flat().filter(d => d.estado === 'A').length;
  }
  get porcentaje(): number {
    const diasMes = this.semanas.flat().filter(d => d.fecha.getMonth() === this.mes).length;
    return diasMes ? (this.presentes / diasMes) * 100 : 0;
  }
}