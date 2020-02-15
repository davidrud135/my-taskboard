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
import { MatSnackBar } from '@angular/material/snack-bar';
import { firestore } from 'firebase/app';
import { Subscription } from 'rxjs';

import { TaskboardService } from './../../taskboard.service';
import { AuthService } from './../../../auth/auth.service';
import { User } from '../../models/user.model';
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
  @ViewChild('cardTitleField')
  cardTitleField: ElementRef;
  @ViewChild('cardDescriptionField')
  cardDescriptionField: ElementRef;
  card: Card;
  currUser: User;
  cardSub: Subscription;
  userSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private cardDialogRef: MatDialogRef<CardDialogComponent>,
    private taskboardService: TaskboardService,
    private authService: AuthService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const { listId, cardId } = this.data;
    this.cardSub = this.taskboardService
      .getCardData(listId, cardId)
      .subscribe((cardData: Card) => {
        this.card = cardData;
      });
    this.userSub = this.authService.getUser().subscribe((user: User) => {
      this.currUser = user;
    });
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
    if (oldCardDesc === newCardDesc) {
      nativeElement.value = oldCardDesc;
      return;
    }
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      description: newCardDesc,
    });
  }

  onVoteChange(vote: boolean): void {
    const { listId, cardId } = this.data;
    const { id } = this.currUser;
    this.taskboardService.updateCardData(listId, cardId, {
      usersIdsWhoVoted: vote
        ? firestore.FieldValue.arrayUnion(id)
        : firestore.FieldValue.arrayRemove(id),
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
        if (!isConfirmed) return;
        this.taskboardService
          .removeCard(this.data.listId, cardId)
          .then(() => {
            this.cardDialogRef.close();
          })
          .catch((errMsg: string) => {
            this.snackBar.open(`❗${errMsg}❗`, 'OK');
          });
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.cardSub.unsubscribe();
  }
}
