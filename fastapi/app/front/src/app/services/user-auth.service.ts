import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GetDataFirebaseService } from './get-data-firebase.service';
import { DocumentReference } from '@angular/fire/firestore';
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';
import User from '../interfaces/user.interface';
import { GranjaDataService } from './granja-data.service';


@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private user: User = {
    name: "",
    uid: "",
    granjas: [],
    role: ""
  }
  userCredentials: any;
  granjaDataService: any;
  constructor(
    private firebaseAuthenticationService: AngularFireAuth,
    private ngZone: NgZone,
    private router: Router,
    private getDataFirebase: GetDataFirebaseService
  ) {

    this.firebaseAuthenticationService.authState.subscribe(user => {
      if (user) {
        this.userCredentials = user;
        localStorage.setItem('user', JSON.stringify(this.userCredentials));
      } else {
        localStorage.setItem('user', 'null');
      }
    })
  }

  //generar el inicio de sesion
  async login(email: string, password: string) {
    return await this.firebaseAuthenticationService.signInWithEmailAndPassword(email, password)
      .then(async (userCredentials) => {
        this.userCredentials = userCredentials.user;
        await this.getUserData(this.userCredentials);
        this.observeUserState();
      }).catch((error) => {
        return error;
      });
  }

  observeUserState() {
    this.firebaseAuthenticationService.authState.subscribe((userState) => {
      userState && this.ngZone.run(() => this.router.navigate(['menu-granjas']));
    })
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null;
  }

  async getUserData(userCredentials: any) {
    const uid: string = userCredentials.uid

    await this.getDataFirebase.getDocByPath(`usuarios/${uid}`).then((userDataDoc) => {
      if (userDataDoc) {
        const userData: any = userDataDoc.data()
        this.user = {
          name: userData.name,
          uid: uid,
          granjas: userData.granjas,
          role: userData.role
        }
      }
    })
  }

  async verifyUser() {
    return await this.firebaseAuthenticationService.currentUser.then((user) => {
      return user ? true : false;
    })
  }

  getUser() {
    return this.user;
  }

  async addGranjaToUser(granjaRef: DocumentReference) {
    this.user.granjas.push(granjaRef);
    await this.getDataFirebase.updateDoc(`usuarios/${this.user.uid}`, { granjas: this.user.granjas });
  }

  async deleteGranja(granjaRef: DocumentReference) {
    this.user.granjas.splice(this.user.granjas.indexOf(granjaRef), 1);
    await this.getDataFirebase.updateDoc(`usuarios/${this.user.uid}`, { granjas: this.user.granjas });
    return true;
  }

  async register(email: string, password: string, nameUser: string, granjasUser: DocumentReference[] = []) {
    return this.firebaseAuthenticationService.createUserWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        this.userCredentials = userCredentials.user;
        this.observeUserState();
        this.getDataFirebase.createDoc('usuarios/', { name: nameUser, granjas: [], role: 'user' }, this.userCredentials.uid);
      }).catch((error) => {
        console.error(error.message + ' Por favor, intenta de nuevo');
      });
  }
}
