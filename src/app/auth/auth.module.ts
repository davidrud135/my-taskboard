import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFireAuthModule } from '@angular/fire/auth';

// Material modules
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { environment } from '@env/environment';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { AnonymousGuard } from './anonymous.guard';

const routes: Routes = [
  {
    path: 'sign-up',
    component: SignUpComponent,
    canActivate: [AnonymousGuard],
    data: {
      routeTitle: `Register | ${environment.projectTitle}`,
    },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [AnonymousGuard],
    data: {
      routeTitle: `Login | ${environment.projectTitle}`,
    },
  },
];

const materialModules = [
  MatProgressSpinnerModule,
  MatCardModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatSnackBarModule,
  MatDividerModule,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FlexLayoutModule,
    AngularFireAuthModule,
    ...materialModules,
  ],
  exports: [...materialModules],
  declarations: [SignUpComponent, SignInComponent],
})
export class AuthModule {}
