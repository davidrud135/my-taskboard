import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { AuthService } from '@app/auth/auth.service';
import { TaskboardService } from '@core/taskboard.service';
import { User } from '@core/models/user.model';
import { FirestoreBoard } from '@core/models/firestore-board.model';
import { CreateBoardDialogComponent } from '@components/create-board-dialog/create-board-dialog.component';
import { boardTrackByFn } from '@app/utils/trackby-functions';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
})
export class BoardsComponent implements OnInit {
  currUser$: Observable<User>;
  personalBoards$: Observable<(FirestoreBoard & { id: string })[]>;
  favoriteBoards$: Observable<(FirestoreBoard & { id: string })[]>;
  boardTrackByFn = boardTrackByFn;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private authService: AuthService,
    private taskboardService: TaskboardService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data: Data) => {
      this.titleService.setTitle(data['routeTitle']);
    });
    this.currUser$ = this.authService.getUser();
    this.personalBoards$ = this.taskboardService.getPersonalBoards();
    this.favoriteBoards$ = this.taskboardService.getFavoriteBoards();
  }

  onCreateBoard() {
    this.dialog.open(CreateBoardDialogComponent, {
      maxWidth: '95vw',
      width: '400px',
    });
  }
}
