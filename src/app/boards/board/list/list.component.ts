import { Observable } from 'rxjs';
// tslint:disable: align
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { TaskboardService } from './../../../core/taskboard.service';
import { Card } from './../../../core/models/card.model';
import { List } from './../../../core/models/list.model';
import { CardDialogComponent } from './../../../core/components/card-dialog/card-dialog.component';
import { RemovalConfirmDialogComponent } from './../../../core/components/removal-confirm-dialog/removal-confirm-dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @Input('listData') list: List;
  cards$: Observable<Card[]>;
  @ViewChild('listTitleField', { static: false })
  listTitleField: ElementRef;
  @ViewChild('newCardTitleField', { static: false })
  newCardTitleField: ElementRef;
  isNewCardTemplateOpened = false;

  constructor(
    private taskboardService: TaskboardService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.cards$ = this.taskboardService.getListCards(this.list.id);
  }

  onEditListTitle(): void {
    const oldListTitle = this.list.title;
    const { nativeElement } = this.listTitleField;
    const newListTitle = nativeElement.value.trim();
    if (!newListTitle || oldListTitle === newListTitle) {
      nativeElement.value = oldListTitle;
      return;
    }
    this.taskboardService.updateListData(this.list.id, { title: newListTitle });
  }

  openCardDialog(card: Card) {
    this.dialog.open(CardDialogComponent, {
      data: {
        cardId: card.id,
        listId: this.list.id,
        listTitle: this.list.title,
      },
      autoFocus: false,
      maxWidth: '95vw',
      width: '700px',
      maxHeight: '95vw',
    });
  }

  openNewCardTemplate() {
    this.isNewCardTemplateOpened = true;
    setTimeout(() => {
      const { nativeElement } = this.newCardTitleField;
      nativeElement.focus();
      nativeElement.style.height = '18px';
    }, 50);
  }

  closeNewCardTemplate() {
    this.isNewCardTemplateOpened = false;
    this.newCardTitleField.nativeElement.value = '';
  }

  onAddCardToList() {
    const newCardTitle = this.newCardTitleField.nativeElement.value.trim();
    if (!newCardTitle) return;
    this.taskboardService.createCard(this.list.id, newCardTitle);
    this.closeNewCardTemplate();
  }

  openListRemovalConfirmDialog(): void {
    this.dialog
      .open(RemovalConfirmDialogComponent, {
        data: {
          headerTitle: this.list.title,
          bodyText:
            'Are you sure you want to remove the list and all its cards?',
        },
      })
      .afterClosed()
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          this.taskboardService.removeList(this.list.id);
        }
      });
  }
}
