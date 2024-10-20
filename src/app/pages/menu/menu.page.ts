import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SpinnerService } from '../../services/spinner.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import {
  DeviceMotion,
  DeviceMotionAccelerationData,
} from '@ionic-native/device-motion/ngx';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage {
  authService = inject(AuthService);
  router = inject(Router);
  spinnerService = inject(SpinnerService);

  public backgroundColor: string = '#FFDA76';
  public intervalId: any;
  constructor(
    public ruteo: Router,
    public screenOrientation: ScreenOrientation,
    public deviceMotion: DeviceMotion,
    private vibration: Vibration,
    private flashlight: Flashlight
  ) {
    this.backgroundColor = '#FFDA76';
  }

  async cerrarSesion() {
    const resultado = await this.authService.cerrarSesion();
    if (resultado) {
      this.router.navigate(['/login']);
    } else {
      //mensaje
      this.spinnerService.mostrarMensaje({
        message: 'Uuuup! Ocurrio un error en cerrar la sesión.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }

  alarmOnOff = false;
  showDialog = false;
  estado = '';
  clave = '';
  //Sonidos
  audioIzquierda = '../../assets/audios/quemetocas.mp3';
  audioDerecha = '../../assets/audios/estanchoriando.mp3';
  audioVertical = '../../assets/audios/bajaeltelefono.mp3';
  audioHorizontal = '../../assets/audios/epa.mp3';
  audioError = '../../assets/audios/alarma.mp3';

  audio = new Audio();

  subscription: any;
  //Ingresos para flash
  primerIngreso = true;
  primerIngresoFlash = true;

  //ORIENTACION
  posicionActualCelular = 'actual';
  posicionAnteriorCelular = 'anterior';

  mostrarDialog = true;

  // Inclinacion
  accelerationX: any;
  accelerationY: any;
  accelerationZ: any;

  cambiarAlarma() {
    if (this.alarmOnOff === true) {
      this.checkPassword();
    } else {
      this.alarmOnOff = true;
      this.comenzar();
    }
  }

  parar() {
    this.mostrarDialog = true;
    this.primerIngreso = true;
    this.subscription.unsubscribe();
  }

  comenzar() {
    // Iniciar el cambio de color cada 5 segundos
    this.intervalId = setInterval(() => {
      this.changeBackgroundColor();
    }, 1000);

    this.subscription = this.deviceMotion
      .watchAcceleration({ frequency: 300 })
      .subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.accelerationX = Math.floor(acceleration.x);
        this.accelerationY = Math.floor(acceleration.y);
        this.accelerationZ = Math.floor(acceleration.z);

        if (acceleration.x > 5) {
          //Inclinacion Izquierda
          this.posicionActualCelular = 'izquierda';
          this.movimientoIzquierda();
        } else if (acceleration.x < -5) {
          //Inclinacion Derecha

          this.posicionActualCelular = 'derecha';
          this.movimientoDerecha();
        } else if (acceleration.y >= 9) {
          //encender flash por 5 segundos y sonido
          this.posicionActualCelular = 'arriba';

          if (this.posicionActualCelular !== this.posicionAnteriorCelular) {
            this.audio.src = this.audioVertical;
            this.posicionAnteriorCelular = 'arriba';
          }
          this.audio.play();
          this.movimientoVertical();
        } else if (
          acceleration.z >= 9 &&
          acceleration.y >= -1 &&
          acceleration.y <= 1 &&
          acceleration.x >= -1 &&
          acceleration.x <= 1
        ) {
          //acostado vibrar por 5 segundos y sonido
          this.posicionActualCelular = 'plano';
          this.movimientoHorizontal();
        }
      });
  }

  movimientoIzquierda() {
    this.primerIngreso = false;
    this.primerIngresoFlash = true;
    if (this.posicionActualCelular !== this.posicionAnteriorCelular) {
      this.posicionAnteriorCelular = 'izquierda';
      this.audio.src = this.audioIzquierda;
    }
    this.audio.play();
  }

  movimientoDerecha() {
    this.primerIngreso = false;
    this.primerIngresoFlash = true;
    if (this.posicionActualCelular !== this.posicionAnteriorCelular) {
      this.posicionAnteriorCelular = 'derecha';
      this.audio.src = this.audioDerecha;
    }
    this.audio.play();
  }

  movimientoVertical() {
    if (this.primerIngresoFlash) {
      this.primerIngresoFlash ? this.flashlight.switchOn() : null;
      setTimeout(() => {
        this.primerIngresoFlash = false;
        this.flashlight.switchOff();
      }, 5000);
      this.primerIngreso = false;
    }
  }

  movimientoHorizontal() {
    if (this.posicionActualCelular !== this.posicionAnteriorCelular) {
      this.posicionAnteriorCelular = 'plano';
      this.audio.src = this.audioHorizontal;
    }

    this.primerIngreso ? null : this.audio.play();

    this.primerIngreso ? null : this.vibration.vibrate(5000);
    this.primerIngreso = true;
    this.primerIngresoFlash = true;
  }

  errorApagado() {
    this.flashlight.switchOn();
    this.audio.src = this.audioError;
    this.audio.play();
    this.vibration.vibrate(5000);
    setTimeout(() => {
      this.primerIngresoFlash = false;
      this.flashlight.switchOff();
      this.vibration.vibrate(0);
    }, 5000);
  }

  async checkPassword() {
    const { value: password } = await Swal.fire({
      title: 'Sonará, cada 5 segundos al menos que ingrese la clave!!',
      input: 'password',
      icon: 'warning',
      inputLabel: '',
      inputPlaceholder: 'Ingrese la clave',
      heightAuto: false,
      background: 'rgb(249 95 47)',
      confirmButtonColor: '#FABC3F',
      color: 'black',
      showClass: {
        popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
      },
      hideClass: {
        popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
      },
    });

    this.clave = password;
    if (this.clave === this.authService.actualPassword) {
      //Comparacion de usuario registrado con la clave ingresada recientemente
      // Detener el cambio de color si ingreso la contraseña correctamente
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.backgroundColor = '#FFDA76';
      console.log('ENTRE, actual password', this.authService.actualPassword);
      this.estado = 'permitido';
      this.alarmOnOff = false;
      this.estado = '';
      this.clave = '';
      this.audio.pause();
      this.parar(); ///Paro la subscripcion al acceleration
      // Detener el cambio de color si estaba activo
    } else if (this.clave !== '') {
      this.estado = 'denegado';
      this.backgroundColor = 'red';
      this.errorApagado();
      setTimeout(() => {
        this.estado = '';
      }, 1000);
      // // Iniciar el cambio de color cada 5 segundos
      // this.intervalId = setInterval(() => {
      //   this.changeBackgroundColor();
      // }, 2000);

    }
   
  }

  changeBackgroundColor() {
    const colors = ['red', '#FF6600', '#F9E400']; // Colores a utilizar
    let index = colors.indexOf(this.backgroundColor); // Índice del color actual
    index = (index + 1) % colors.length; // Cálculo del siguiente índice
    this.backgroundColor = colors[index]; // Asignar el nuevo color
  }
}
