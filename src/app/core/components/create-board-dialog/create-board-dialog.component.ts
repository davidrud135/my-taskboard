import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { BoardBackColor } from './../../models/board-back-color.model';
import { TaskboardService } from './../../taskboard.service';

@Component({
  selector: 'app-create-board-dialog',
  templateUrl: './create-board-dialog.component.html',
  styleUrls: ['./create-board-dialog.component.scss'],
})
export class CreateBoardDialogComponent implements OnInit {
  boardTitleControl: FormControl;
  boardSelectedBackColor: string;
  boardBackColors: string[];

  constructor(
    public dialogRef: MatDialogRef<CreateBoardDialogComponent>,
    private taskboardService: TaskboardService,
  ) {}

  ngOnInit() {
    this.boardTitleControl = new FormControl('', [
      Validators.required,
      this.noEmptyValueValidator,
    ]);
    this.boardSelectedBackColor = BoardBackColor.Green;
    this.boardBackColors = Object.values(BoardBackColor);
  }

  onBoardCreate(): void {
    if (this.boardTitleControl.invalid) return;
    const title = this.boardTitleControl.value.trim();
    this.taskboardService.createBoard(title, this.boardSelectedBackColor);
    this.dialogRef.close();
  }

  noEmptyValueValidator(control: FormControl): { emptyValue: boolean } | null {
    const isEmptyValue = control.value.trim().length === 0;
    return isEmptyValue ? { emptyValue: true } : null;
  }
}
