import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  totalAlumnos = 0;
  totalProfesores = 0;
  totalAsignaturas = 0;
  totalInscripciones = 0;
  esAdmin: boolean = false; // <- Agregado

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    const nombreRes = await Preferences.get({ key: 'nombreUsuario' });
    const nombre = nombreRes.value || '';

     this.esAdmin = nombre.toLowerCase().includes('admin');

    this.apiService.obtenerPanelAdmin(nombre).subscribe({
      next: (res) => {
        this.totalAlumnos = res.totalAlumnos;
        this.totalProfesores = res.totalProfesores;
        this.totalAsignaturas = res.totalAsignaturas;
        this.totalInscripciones = res.totalInscripciones;
      },
      error: (err) => {
        console.error('Error al obtener panel admin:', err);
      }
    });
  }
}
