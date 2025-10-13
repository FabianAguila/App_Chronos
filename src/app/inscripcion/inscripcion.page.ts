import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscripcion',
  templateUrl: './inscripcion.page.html',
  styleUrls: ['./inscripcion.page.scss'],
})
export class InscripcionPage implements OnInit {

  asignaturas: any[] = [];
  asignaturaSeleccionada: number | null = null;
  alumnoId: number = 0;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    const { value } = await Preferences.get({ key: 'alumnoId' });
    this.alumnoId = Number(value);

    this.apiService.getAsignaturas().subscribe({
      next: (data) => {
        console.log('Asignaturas cargadas:', data);
        this.asignaturas = data;
      },
      error: (err) => {
        console.error('Error al cargar asignaturas', err);
      }
    });
  }

  inscribir() {
    if (!this.asignaturaSeleccionada) {
      alert('Debes seleccionar una asignatura.');
      return;
    }

    const data = {
      alumnoId: this.alumnoId,
      asignaturaId: this.asignaturaSeleccionada
    };

    console.log('Enviando inscripción:', data);

    this.apiService.inscribirAlumno(data).subscribe({
      next: (res) => {
        alert('Inscripción exitosa');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al inscribirse', err);
        alert(err.error);
      }
    });
  }
}
