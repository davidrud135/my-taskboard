import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TaskboardService } from './../../taskboard.service';
import { Card } from './../../models/card.model';
import { RemovalConfirmDialogComponent } from './../removal-confirm-dialog/removal-confirm-dialog.component';

interface DialogData {
  cardId: string;
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
  card$: Observable<Card>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private cardDialogRef: MatDialogRef<CardDialogComponent>,
    public dialog: MatDialog,
    private taskboardService: TaskboardService,
  ) {}

  ngOnInit(): void {
    const { listId, cardId } = this.data;
    this.card$ = this.taskboardService.getCardData(listId, cardId);
  }

  onCardTitleEdit(oldCardTitle: string): void {
    const { nativeElement } = this.cardTitleField;
    const newCardTitle = nativeElement.value.trim();
    if (!newCardTitle || oldCardTitle === newCardTitle) {
      nativeElement.value = oldCardTitle;
      return;
    }
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      title: newCardTitle,
    });
  }

  onCardDescriptionEdit(oldCardDesc: string): void {
    const { nativeElement } = this.cardDescriptionField;
    const newCardDesc = nativeElement.value.trim();
    if (!newCardDesc || oldCardDesc === newCardDesc) {
      nativeElement.value = oldCardDesc;
      return;
    }
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      description: newCardDesc,
    });
  }

  onCardRemove(cardId: string, cardTitle: string): void {
    this.dialog
      .open(RemovalConfirmDialogComponent, {
        data: {
          headerTitle: cardTitle,
          bodyText: 'Are you sure you want to delete this card?',
        },
      })
      .afterClosed()
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          this.cardDialogRef.close();
          this.taskboardService.removeCard(this.data.listId, cardId);
        }
      });
  }
}
