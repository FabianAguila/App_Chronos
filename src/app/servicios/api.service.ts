import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfesorDto, CursoCardDto, TeacherDashboardDto } from '../profesor/teacher.dtos';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
private apiUrl = environment.apiUrl || 'https://apichronos-production.up.railway.app';

  constructor(private http: HttpClient) { }

  registrarProfesor(profesor: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Profesor`, profesor);
  }
  // CRUD de Notas (Profesor)
  getNotasCurso(cursoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Profesor/curso/${cursoId}/notas`);
  }
  crearNota(cursoId: number, nota: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Profesor/curso/${cursoId}/notas`, nota);
  }
  actualizarNota(cursoId: number, notaId: number, nota: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Profesor/curso/${cursoId}/notas/${notaId}`, nota);
  }
  eliminarNota(cursoId: number, notaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Profesor/curso/${cursoId}/notas/${notaId}`);
  }

  // CRUD de Asistencia (Profesor)
  getAsistenciaCurso(cursoId: number, fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Profesor/curso/${cursoId}/asistencia`, { params: { fecha } });
  }
  crearAsistencia(cursoId: number, asistencia: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Profesor/curso/${cursoId}/asistencia`, asistencia);
  }
  actualizarAsistencia(cursoId: number, asistenciaId: number, asistencia: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Profesor/curso/${cursoId}/asistencia/${asistenciaId}`, asistencia);
  }
  eliminarAsistencia(cursoId: number, asistenciaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Profesor/curso/${cursoId}/asistencia/${asistenciaId}`);
  }

  registrarAlumno(alumno: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Alumno/registrar`, alumno);
  }
  // ...existing code...

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

    // ===== ADMIN: gestión de asignaturas =====
  crearAsignatura(asignatura: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Asignatura`, asignatura);
  }

  // ===== ADMIN: gestión de usuarios =====
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Usuario`);
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Usuario/${id}`, usuario);
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

  getAlumnosProfesor(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Profesor/${id}/alumnos`);
  }

  getAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Alumno`);
  }

  getAlumno(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Alumno/${id}`);
  }

  updateAlumno(id: number, alumno: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Alumno/${id}`, alumno);
  }
}
