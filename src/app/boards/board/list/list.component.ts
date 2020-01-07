// tslint:disable: align
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';

import { TaskboardService } from './../../../core/taskboard.service';
import { Card } from './../../../core/models/card.model';
import { List } from './../../../core/models/list.model';
import { ListSorting } from './../../../core/models/list-sorting.model';
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
  listSortingStrategy$ = new BehaviorSubject<ListSorting>('asc');
  listTitleControl: FormControl;
  @ViewChild('newCardTitleField', { static: false })
  newCardTitleField: ElementRef;
  isNewCardTemplateOpened = false;

  constructor(
    private taskboardService: TaskboardService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.listTitleControl = new FormControl(
      this.list.title,
      Validators.required,
    );
    this.cards$ = this.taskboardService.getListCards(
      this.list.id,
      this.listSortingStrategy$,
    );
  }

  onEditListTitle(oldListTitle: string): void {
    const newListTitle = this.listTitleControl.value.trim();
    if (this.listTitleControl.invalid || oldListTitle === newListTitle) {
      return this.listTitleControl.setValue(oldListTitle);
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

  onListSort(sorting: ListSorting): void {
    this.listSortingStrategy$.next(sorting);
  }
}
