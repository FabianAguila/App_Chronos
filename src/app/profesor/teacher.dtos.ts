export interface ProfesorDto {
  id: number;
  nom_prof: string;
}

export interface CursoCardDto {
  id: number;
  nombre: string;      // coincide con el JSON de tu API
  alumnos: number;
  imagen?: string | null;
  grado?: number | null;
}

export interface TeacherDashboardDto {
  totalCursos: number;
  totalAlumnos: number;
  asistenciasHoy: number;
  notasHoy: number;
}
