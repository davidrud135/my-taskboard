import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

import { Board } from '../core/models/board.model';
import { TaskboardService } from './../core/taskboard.service';
import { CreateBoardDialogComponent } from './../core/components/create-board-dialog/create-board-dialog.component';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
})
export class BoardsComponent implements OnInit {
  boards: Board[];

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private taskboardService: TaskboardService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data: Data) => {
      this.titleService.setTitle(data['routeTitle']);
    });
    this.boards = this.taskboardService.getBoards();
  }

  onCreateBoard() {
    this.dialog.open(CreateBoardDialogComponent);
  }
}
