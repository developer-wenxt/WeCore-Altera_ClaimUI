import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  setToken(token: string): void {
    sessionStorage.setItem('ssoToken', token);
  }
  getToken(): string {
    return sessionStorage.getItem('ssoToken') || '';
  }

  setWecorePath(path: string): void {
    sessionStorage.setItem('wecorePath', path || '');
  }
  getWecorePath(): string {
    return sessionStorage.getItem('wecorePath') || '';
  }

  setUserDetails(details: any): void {
    sessionStorage.setItem('userDetails', JSON.stringify(details || {}));
  }
  getUserDetails(): any {
    const stored = sessionStorage.getItem('userDetails');
    return stored ? JSON.parse(stored) : null;
  }
}