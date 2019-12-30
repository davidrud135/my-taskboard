import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { Card } from './../../models/card.model';
import { RemovalConfirmDialogComponent } from './../removal-confirm-dialog/removal-confirm-dialog.component';

interface DialogData {
  card: Card;
  listId: string;
  listTitle: string;
}

@Component({
  selector: 'app-card-dialog',
  templateUrl: './card-dialog.component.html',
  styleUrls: ['./card-dialog.component.scss'],
})
export class CardDialogComponent implements OnInit {
  @ViewChild('cardTitleField', { static: false })
  cardTitleField: ElementRef;
  @ViewChild('cardDescriptionField', { static: false })
  cardDescriptionField: ElementRef;
  card: Card;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.card = this.data.card;
  }

  onCardTitleEdit(oldCardTitle: string): void {
    const { nativeElement } = this.cardTitleField;
    const newCardTitle = nativeElement.value.trim();
    if (!newCardTitle || oldCardTitle === newCardTitle) {
      nativeElement.value = oldCardTitle;
      return;
    }
    console.log(
      `Change card title from '${oldCardTitle}' to '${newCardTitle}'`,
    );
  }

  onCardDescriptionEdit(oldCardDesc: string): void {
    const { nativeElement } = this.cardDescriptionField;
    const newCardDesc = nativeElement.value.trim();
    if (!newCardDesc || oldCardDesc === newCardDesc) {
      nativeElement.value = oldCardDesc;
      return;
    }
    console.log(`Change card title from '${oldCardDesc}' to '${newCardDesc}'`);
  }

  onCardRemove() {
    this.dialog
      .open(RemovalConfirmDialogComponent, {
        data: {
          headerTitle: this.card.title,
          bodyText: 'Are you sure you want to delete this card?',
        },
      })
      .afterClosed()
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          console.log(`Remove card with id '${this.card.id}'`);
        }
      });
  }
}
