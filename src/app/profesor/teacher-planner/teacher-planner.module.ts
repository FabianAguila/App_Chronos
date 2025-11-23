import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TeacherPlannerPage } from './teacher-planner.page';

const routes: Routes = [
  { path: '', component: TeacherPlannerPage }
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TeacherPlannerPage]
})
export class TeacherPlannerModule {}
