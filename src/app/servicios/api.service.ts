import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfesorDto, CursoCardDto, TeacherDashboardDto } from '../profesor/teacher.dtos';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://localhost:7020/api';

  constructor(private http: HttpClient) {}

  registrarAlumno(alumno: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Alumno/registrar`, alumno);
  }

  iniciarSesion(datosLogin: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Alumno/login`, datosLogin);
  }

  getAlumnoPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Alumno/${id}`);
  }

  getDetalleAlumno(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Alumno/detalle/${id}`);
  }

  getAsignaturas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Asignatura`);
  }

  inscribirAlumno(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Inscripcion`, data);
  }

  getAlumnoCompleto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Alumno/completo/${id}`);
  }

  getInscripcionAlumno(alumnoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Inscripcion/alumno/${alumnoId}`);
  }

  eliminarInscripcion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Inscripcion/${id}`);
  }

  obtenerPanelAdmin(nombre: string) {
    return this.http.get<any>(`${this.apiUrl}/admin/detalle`, { params: { nombre } });
  }

  registrarAsistencia(payload: any, nombreUsuario: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Asistencia`, payload, { params: { nombreUsuario } });
  }

  asistenciaRegistradaHoy(alumnoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Asistencia/registradaHoy/${alumnoId}`);
  }

  cargarNotas(nuevaNota: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Notas`, { params: { nuevaNota: nuevaNota.toString() } });
  }

  // 🔽🔽 PROFESOR (tipado + URL correcta)
  getProfesor(id: number): Observable<ProfesorDto> {
    return this.http.get<ProfesorDto>(`${this.apiUrl}/Profesor/${id}`);
  }

  getCursosProfesor(id: number): Observable<CursoCardDto[]> {
    return this.http.get<CursoCardDto[]>(`${this.apiUrl}/Profesor/${id}/cursos`);
  }

  getDashboardProfesor(id: number): Observable<TeacherDashboardDto> {
    return this.http.get<TeacherDashboardDto>(`${this.apiUrl}/Profesor/${id}/dashboard`);
  }
}
