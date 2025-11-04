import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { map } from 'rxjs/operators';

//const AUTH_API = 'http://localhost:8083/api/auth/';
const AUTH_API = 'http://13.220.51.254:8083/api/auth/';
//const ROLE_API = 'http://localhost:8082/api/user/role'; // Added API for fetching user role
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private storageService: StorageService) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      {
        username,
        password,
      },
      httpOptions
    );
  }
  

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      {
        username,
        email,
        password,
      },
      httpOptions
    );
  }


  logout(): Observable<any> {
    this.storageService.clear('selectedFuelType');
    this.storageService.clear('selectedQuarter');
    return this.http.post(AUTH_API + 'signout',{}, httpOptions);
  }
  forgotPassword(email: string): Observable<any> {
    return this.http.post(AUTH_API + 'forgot-password', { email });
  }
  
  resetPassword(token: string, newPassword: string) {
    return this.http.post(AUTH_API + 'reset-password/' + token, { token, newPassword });
  }
  

}
