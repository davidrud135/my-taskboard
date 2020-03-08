import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './modules/material.module';
import { AuthModule } from './auth/auth.module';

import { environment } from './../environments/environment';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { BoardsComponent } from './boards/boards.component';
import { CreateBoardDialogComponent } from './core/components/create-board-dialog/create-board-dialog.component';
import { BoardComponent } from './boards/board/board.component';
import { ListComponent } from './boards/board/list/list.component';
import { CardDialogComponent } from './core/components/card-dialog/card-dialog.component';
import { RemovalConfirmDialogComponent } from './core/components/removal-confirm-dialog/removal-confirm-dialog.component';
import { CardFileUploadComponent } from './core/components/card-file-upload/card-file-upload.component';
import { DropAreaDirective } from './utils/drop-area.directive';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BoardsComponent,
    CreateBoardDialogComponent,
    BoardComponent,
    ListComponent,
    CardDialogComponent,
    RemovalConfirmDialogComponent,
    CardFileUploadComponent,
    DropAreaDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FlexLayoutModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
