import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private storageKey = 'usuarios';

  constructor() { }

  guardarUsuario(usuario:any) : void {
    const usuariosGuardados = this.obtenerUser();
    usuariosGuardados.push(usuario);
    localStorage.setItem(this.storageKey, JSON.stringify(usuariosGuardados));
  }

  obtenerUser():any[] {
    const usuariosGuardados = localStorage.getItem(this.storageKey);
    return usuariosGuardados ? JSON.parse(usuariosGuardados):[];
  }

}
