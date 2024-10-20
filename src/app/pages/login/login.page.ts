import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  authServicio = inject(AuthService);
  spinnerServicio = inject(SpinnerService);
  router = inject(Router);

  formLogin = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(10),
    ]),
  });

  constructor() {}

  async iniciarSesion() {
    const loading = await this.spinnerServicio.loading();
    loading.present();

    if (this.formLogin.valid) {
      const { email, password } = this.formLogin.value;
      this.authServicio
        .signIn(email, password)
        .then((user) => {
          const usuario = user.user;
          this.authServicio
            .obtenerDocumento(`usuarios/${usuario.uid}`)
            .then((user: User) => {
              //Guardo localmente el usuario actual
              this.authServicio.actualPassword = password;
              this.authServicio.guardarLocalStorage('usuario', user);
              this.router.navigate(['menu']);
              this.formLogin.reset();

              //mensaje
              this.spinnerServicio.mostrarMensaje({
                message: `Bienvenido ${user.username}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'person-circle-outline',
              });
            });
        })
        .catch((error) => {
          //mensaje
          this.spinnerServicio.mostrarMensaje({
            message: 'Uuups! Contraseña o usuario incorrecto.',
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
          this.formLogin.reset();
        })
        .finally(() => loading.dismiss());
    }
  }

  onSelectProfile(event: any) {
    const selectedProfile = event.detail.value;
    this.loginAutomatico(selectedProfile);
  }

  loginAutomatico(perfil: string) {
    switch (perfil) {
      case 'admin':
        this.formLogin.patchValue({
          email: 'admin@gmail.com',
          password: 'admin1',
        });
        break;
      case 'invitado':
        this.formLogin.setValue({
          email: 'invitado@gmail.com',
          password: 'invitado',
        });
        break;
      case 'anonimo':
        this.formLogin.setValue({
          email: 'anonimo@gmail.com',
          password: 'anonimo1',
        });
        break;
    }
  }
}
