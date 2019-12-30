// tslint:disable: align
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
  @ViewChild('listTitleField', { static: false })
  listTitleField: ElementRef;
  @ViewChild('newCardTitleField', { static: false })
  newCardTitleField: ElementRef;
  isNewCardTemplateOpened = false;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  onEditListTitle(oldListTitle: string): void {
    const { nativeElement } = this.listTitleField;
    const newListTitle = nativeElement.value.trim();
    if (!newListTitle || oldListTitle === newListTitle) {
      nativeElement.value = oldListTitle;
      return;
    }
    console.log(
      `Change board title from '${oldListTitle}' to '${newListTitle}'`,
    );
  }

  openCardDialog(card: Card) {
    this.dialog.open(CardDialogComponent, {
      data: {
        card,
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
    console.log(`Add card '${newCardTitle}' to list with id ${this.list.id}`);
    this.closeNewCardTemplate();
  }

  openListRemovalConfirmDialog(title: string): void {
    this.dialog
      .open(RemovalConfirmDialogComponent, {
        data: {
          headerTitle: title,
          bodyText:
            'Are you sure you want to remove the list and all its cards?',
        },
      })
      .afterClosed()
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          console.log(`Remove list with id '${this.list.id}'`);
        }
      });
  }
}
