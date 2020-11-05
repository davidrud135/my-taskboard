import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { environment } from '@env/environment';
import { AppRoutingModule } from '@app/app-routing.module';
import { MaterialModule } from '@app/modules/material.module';
import { AuthModule } from '@app/auth/auth.module';
import { DropAreaDirective } from '@app/utils/drop-area.directive';
import { FileSizePipe } from '@core/pipes/file-size.pipe';

import { AppComponent } from '@app/app.component';
import { HeaderComponent } from '@app/header/header.component';
import { BoardsComponent } from '@app/boards/boards.component';
import { BoardComponent } from '@app/boards/board/board.component';
import { ListComponent } from '@app/boards/board/list/list.component';
import { UserProfileComponent } from '@app/user-profile/user-profile.component';
import { CreateBoardDialogComponent } from '@components/create-board-dialog/create-board-dialog.component';
import { CardDialogComponent } from '@components/card-dialog/card-dialog.component';
import { RemovalConfirmDialogComponent } from '@components/removal-confirm-dialog/removal-confirm-dialog.component';
import { CardFileUploadComponent } from '@components/card-file-upload/card-file-upload.component';
import { ProfileAvatarActionsComponent } from '@components/profile-avatar-actions/profile-avatar-actions.component';

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
    ProfileAvatarActionsComponent,
    UserProfileComponent,
    FileSizePipe,
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
