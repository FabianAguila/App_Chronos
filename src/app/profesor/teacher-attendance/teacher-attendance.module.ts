import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TeacherAttendancePage } from './teacher-attendance.page';

const routes: Routes = [
  { path: '', component: TeacherAttendancePage }
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TeacherAttendancePage]
})
export class TeacherAttendanceModule {}
