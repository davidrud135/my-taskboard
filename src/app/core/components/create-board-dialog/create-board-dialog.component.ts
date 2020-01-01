import { Component, OnInit } from '@angular/core';

import { BoardBackColor } from './../../models/board-back-color.model';
import { TaskboardService } from './../../taskboard.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-board-dialog',
  templateUrl: './create-board-dialog.component.html',
  styleUrls: ['./create-board-dialog.component.scss'],
})
export class CreateBoardDialogComponent implements OnInit {
  newBoardTitle: string;
  newBoardSelectedColor: string;
  boardBackColors: string[];

  constructor(
    public dialogRef: MatDialogRef<CreateBoardDialogComponent>,
    private taskboardService: TaskboardService,
  ) {}

  ngOnInit() {
    this.newBoardTitle = '';
    this.newBoardSelectedColor = BoardBackColor.Green;
    this.boardBackColors = Object.values(BoardBackColor);
  }

  onBoardCreate() {
    const title = this.newBoardTitle.trim();
    if (!title) return;
    this.taskboardService.createBoard(title, this.newBoardSelectedColor);
    this.dialogRef.close();
  }
}
