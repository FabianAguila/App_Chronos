import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherHomePage } from './teacher-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeacherRoutingModule
  ],
  declarations: [TeacherHomePage]
})
export class TeacherModule {}
