import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const keyUser = 'datosUsuarios';
const keyAsistencia = 'datosAsistencia';

@Injectable({
  providedIn: 'root'
})
export class GuardadoService {
  public userCorreo = "";
  constructor() { }
  async getItem(llave:string):Promise<string | null>{
    const obj = await Preferences.get({key:llave});
    return obj.value;
  }

  async setItem(llave:string, valor:string){
    await Preferences.set({key:llave,value:valor});
  }

  async agregarUsuario(usuario:any[]){
    const usuarios = await this.obtenerUsuario();
    for (const i of usuarios) {
      if (i) {
        usuario.push(i);
      }
    }
    this.setItem(keyUser,JSON.stringify(usuario));
  }

  async obtenerUsuario(){
    const storage = await this.getItem(keyUser);
    if (storage == null) {
      return [];
    }

    const data:any[] = JSON.parse(storage);
    if (data) {
      return data;
    }else{
      return [];
    }
  }


  async agregarAsistencia(asistencia:any[]){
    const asistencias = await this.obtenerAsistencia();
    for (const i of asistencias) {
      if (i) {
        asistencia.push(i);
      }
    }
    this.setItem(keyAsistencia,JSON.stringify(asistencia));
  }

  async obtenerAsistencia(){
    const storage = await this.getItem(keyAsistencia);
    if (storage == null) {
      return [];
    }

    const data:any[] = JSON.parse(storage);
    if (data) {
      return data;
    }else{
      return [];
    }
  }



}
