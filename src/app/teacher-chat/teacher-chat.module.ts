import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeacherChatPageRoutingModule } from './teacher-chat-routing.module';
import { TeacherChatPage } from './index';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TeacherChatPageRoutingModule],
  declarations: [TeacherChatPage],
})
export class TeacherChatPageModule {}
