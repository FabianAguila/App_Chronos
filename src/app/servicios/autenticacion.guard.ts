import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';
@Injectable({
  providedIn: 'root'
})
export class AutenticacionGuard implements CanActivate {
  constructor(private autenticacionService: AutenticacionService, private router: Router) {}

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        const isAuthenticated = await this.autenticacionService.IsLoggedIn();
        if (isAuthenticated) {
            return true;
        } else { 
            return this.router.parseUrl('/login'); 
        }
    }
}
  

