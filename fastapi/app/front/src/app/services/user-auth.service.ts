import { Injectable } from '@angular/core';
import User from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private user: User = {
    email: "",
    name: "",
    id: "",
    roles: [],
    granjas: []
  }
  userCredentials: any;
  granjaDataService: any;
  constructor(
    private http: HttpClient,
  ) { }

  //generar el inicio de sesion
  async login(email: string, password: string): Promise<any> {
    return this.http.post('http://localhost:8000/users/login', { email: email, password: password })
      .toPromise()
      .then(response => {
        this.user = response as User;
        return response;
      })
      .catch(error => {
        console.error('Error during login:', error);
        throw error;
      });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null;
  }

  async verifyUser() {
    return true;
  }

  getUser() {
    return this.user;
  }

  async register(email: string, password: string, nameUser: string) {
    return this.http.post('http://localhost:8000/users/register', { email: email, password: password, name: nameUser })
      .toPromise()
      .then(response => {
        console.log(response);
        return response;
      })
      .catch(error => {
        console.error('Error during register:', error);
        throw error;
      });
  }
}
