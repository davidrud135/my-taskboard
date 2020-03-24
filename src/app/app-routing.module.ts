import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { environment } from 'src/environments/environment';
import { BoardsComponent } from './boards/boards.component';
import { AuthGuard } from './auth/auth.guard';
import { BoardComponent } from './boards/board/board.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/boards',
  },
  {
    path: 'boards',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: BoardsComponent,
        data: { routeTitle: `Boards | ${environment.projectTitle}` },
      },
      { path: ':id', component: BoardComponent },
    ],
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
    data: { routeTitle: `Profile | ${environment.projectTitle}` },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
