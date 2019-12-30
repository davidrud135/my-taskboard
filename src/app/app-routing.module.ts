import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BoardsComponent } from './boards/boards.component';
import { AuthGuard } from './auth/auth.guard';
import { environment } from 'src/environments/environment';
import { BoardComponent } from './boards/board/board.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'boards',
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
