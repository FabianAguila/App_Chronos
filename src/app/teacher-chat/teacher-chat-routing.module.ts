import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherChatPage } from './index';

const routes: Routes = [
  {
    path: '',
    component: TeacherChatPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherChatPageRoutingModule {}
