import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { User } from '../core/models/user.model';
import { FirestoreBoard } from '../core/models/firestore-board.model';
import { AuthService } from './../auth/auth.service';
import { TaskboardService } from './../core/taskboard.service';
import { CreateBoardDialogComponent } from './../core/components/create-board-dialog/create-board-dialog.component';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
})
export class BoardsComponent implements OnInit {
  currUser$: Observable<User>;
  personalBoards$: Observable<(FirestoreBoard & { id: string })[]>;
  favoriteBoards$: Observable<(FirestoreBoard & { id: string })[]>;

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
    this.dialog.open(CreateBoardDialogComponent);
  }
}
