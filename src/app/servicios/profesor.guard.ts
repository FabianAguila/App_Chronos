import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class ProfesorGuard implements CanActivate, CanLoad {
  constructor(private router: Router) {}

  private async isProfesor(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'rol' });
    return value === 'profesor';
  }

  async canActivate(): Promise<boolean> {
    if (await this.isProfesor()) return true;
    this.router.navigate(['/login']);
    return false;
  }

  async canLoad(_route: Route, _segments: UrlSegment[]): Promise<boolean> {
    if (await this.isProfesor()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
