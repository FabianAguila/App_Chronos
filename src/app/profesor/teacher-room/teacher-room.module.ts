import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TeacherRoomPage } from './teacher-room.page';

const routes: Routes = [
  { path: '', component: TeacherRoomPage }
];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TeacherRoomPage]
})
export class TeacherRoomModule {}
