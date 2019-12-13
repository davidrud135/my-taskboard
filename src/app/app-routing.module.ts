import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BoardsComponent } from './boards/boards.component';
import { AuthGuard } from './auth/auth.guard';
import { environment } from 'src/environments/environment';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'boards',
    canActivate: [AuthGuard],
  },
  {
    path: 'boards',
    children: [
      {
        path: '',
        component: BoardsComponent,
        data: { routeTitle: `Boards | ${environment.projectTitle}` },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
