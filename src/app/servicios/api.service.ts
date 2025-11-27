import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfesorDto, CursoCardDto, TeacherDashboardDto } from '../profesor/teacher.dtos';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://apichronos-production.up.railway.app';

  constructor(private http: HttpClient) {}

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

  // Login para profesores (endpoint separado en el backend)
  iniciarSesionProfesor(datosLogin: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Profesor/login`, datosLogin);
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

  // Obtener todos los profesores registrados
  getProfesores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Profesor`);
  }

  getCursosProfesor(id: number): Observable<CursoCardDto[]> {
    return this.http.get<CursoCardDto[]>(`${this.apiUrl}/Profesor/${id}/cursos`);
  }

  getDashboardProfesor(id: number): Observable<TeacherDashboardDto> {
    return this.http.get<TeacherDashboardDto>(`${this.apiUrl}/Profesor/${id}/dashboard`);
  }

  // Chat: obtener conversación entre profesor y alumno
  getConversacion(profesorId: number, alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Chat/conversacion/${profesorId}/${alumnoId}`);
  }

  // Enviar mensaje (body: { profesorId, alumnoId, remitente, texto })
  enviarMensaje(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Chat`, payload);
  }

  // Obtener alumnos asociados a un profesor
  getAlumnosProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Profesor/${profesorId}/alumnos`);
  }

  // Obtener todos los alumnos registrados (fallback si existe)
  getAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Alumno`);
  }

  // Agregar una nota para un alumno (payload: { profesorId, alumnoId, valor, tipo?, descripcion?, fecha? })
  agregarNotaAlumno(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Notas`, payload);
  }

  // Marcar asistencia para un alumno (payload: { profesorId, alumnoId, fecha, presente })
  marcarAsistenciaAlumno(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Asistencia`, payload);
  }
}
