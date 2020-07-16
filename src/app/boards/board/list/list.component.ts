// tslint:disable: align
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';

import { List } from '@core/models/list.model';
import { Card } from '@core/models/card.model';
import { TaskboardService } from '@core/taskboard.service';
import { ListSorting } from '@core/models/list-sorting.model';
import { CardDialogComponent } from '@components/card-dialog/card-dialog.component';
import { RemovalConfirmDialogComponent } from '@components/removal-confirm-dialog/removal-confirm-dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @Input('listData') list: List;
  cards: Card[];
  cardsSub: Subscription;
  listTitleControl: FormControl;
  @ViewChild('newCardTitleField')
  newCardTitleField: ElementRef;
  isNewCardTemplateOpened = false;

  constructor(
    private taskboardService: TaskboardService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.listTitleControl = new FormControl(
      this.list.title,
      Validators.required,
    );
    this.cardsSub = this.taskboardService
      .getListCards(this.list.id)
      .subscribe((cards: Card[]) => (this.cards = cards));
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
        isLastCardInList: card.positionNumber === this.cards.length,
      },
      autoFocus: false,
      maxWidth: '95vw',
      width: '700px',
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
    this.taskboardService.createCard(
      this.list.id,
      newCardTitle,
      this.cards.length + 1,
    );
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
        if (!isConfirmed) return;
        const { id, creatorId } = this.list;
        this.taskboardService
          .removeList(id, creatorId)
          .catch((errMsg: string) => {
            this.snackBar.open(`❗${errMsg}❗`, 'OK');
          });
      });
  }

  onListSort(sorting: ListSorting | null): void {
    switch (sorting) {
      case 'asc':
        this.cards.sort(
          (card1, card2) => card1.createdAt.seconds - card2.createdAt.seconds,
        );
        break;
      case 'desc':
        this.cards.sort(
          (card1, card2) => card2.createdAt.seconds - card1.createdAt.seconds,
        );
        break;
      case 'alphabet':
        this.cards.sort((card1, card2) =>
          card1.title.localeCompare(card2.title),
        );
        break;
      default:
        this.cards.sort(
          (card1, card2) => card1.positionNumber - card2.positionNumber,
        );
    }
  }

  onCardDrop(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
      this.taskboardService.updateCardsPositionNumber(this.list.id, this.cards);
    } else {
      const { id } = event.item.data;
      const { previousIndex, currentIndex } = event;
      const [srcListId, srcListCardsNumber] = event.previousContainer.data;
      const [destListId, destListCardsNumber] = event.container.data;
      this.taskboardService.moveCardToAnotherList(
        srcListId,
        destListId,
        id,
        currentIndex,
        srcListCardsNumber === previousIndex + 1,
        destListCardsNumber === currentIndex,
      );
    }
  }
}
