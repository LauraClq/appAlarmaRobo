import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuPageRoutingModule } from './menu-routing.module';

import { MenuPage } from './menu.page';
import { DeviceMotion } from '@ionic-native/device-motion/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@NgModule({
  providers: [DeviceMotion, Vibration, Flashlight, ScreenOrientation],
  imports: [CommonModule, FormsModule, IonicModule, MenuPageRoutingModule],

  declarations: [MenuPage],
})
export class MenuPageModule {}
