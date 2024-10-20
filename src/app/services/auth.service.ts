import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { updateProfile } from '@angular/fire/auth';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any>;
  actualPassword : string = '';
  
  constructor(private auth: AngularFireAuth) {
    this.user$ = this.auth.authState;
  }

  //-----------Authentication---------------

  async signIn(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  //-----------Register------------------------
  async register(email: string, password: string, username: string) {
    const usuario = this.auth.createUserWithEmailAndPassword(email, password);
    const user = (await usuario).user;

    //Actualizar el nombre del usuario
    await updateProfile(user, { displayName: username });

    // Guardar datos en Firestore
    // await this.firestoreServ.collection('usuarios').doc(user.uid).set({
    //   email,
    //   username,
    // });

    this.guardarDocumento(`usuarios/${user.uid}`, { email, username });
    // Guardar token en localStorage
    this.guardarLocalStorage('user', user);

    return usuario;
  }

  //---------LOCALSTORAGE---------

  guardarLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  obtenerLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  //-----------FIRESTORE--------------------

  async guardarDocumento(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  async obtenerDocumento(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  //Cerrar Sesion de usuario
  async cerrarSesion() {
    try {
      localStorage.removeItem('usuario');
      this.actualPassword = '';
      await this.auth.signOut();
      return true;
    } catch {
      return false;
    }
  }
}
