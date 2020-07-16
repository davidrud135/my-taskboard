import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DialogData {
  headerTitle: string;
  bodyText: string;
}

@Component({
  selector: 'app-removal-confirm-dialog',
  templateUrl: './removal-confirm-dialog.component.html',
  styleUrls: ['./removal-confirm-dialog.component.scss'],
})
export class RemovalConfirmDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {}
}
