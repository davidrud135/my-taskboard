import { BoardBackColor } from './../../models/board-back-color.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-board-dialog',
  templateUrl: './create-board-dialog.component.html',
  styleUrls: ['./create-board-dialog.component.scss'],
})
export class CreateBoardDialogComponent implements OnInit {
  newBoardTitle: string;
  newBoardSelectedColor: string;
  boardBackColors: string[];

  constructor() {}

  ngOnInit() {
    this.newBoardTitle = '';
    this.newBoardSelectedColor = BoardBackColor.Green;
    this.boardBackColors = Object.values(BoardBackColor);
  }
}
