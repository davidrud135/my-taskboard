import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectionListChange } from '@angular/material/list';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase/app';
import { Subscription, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from '@app/auth/auth.service';
import { TaskboardService } from '@core/taskboard.service';
import { Card } from '@core/models/card.model';
import { User } from '@core/models/user.model';
import { Tag } from '@core/models/tag.model';
import { List } from '@core/models/list.model';
import { Board } from '@core/models/board.model';
import { CardAttachment } from '@core/models/card-attachment.model';
import { RemovalConfirmDialogComponent } from '@components/removal-confirm-dialog/removal-confirm-dialog.component';
import {
  memberTrackByFn,
  tagTrackByFn,
  trackByIndexFn,
  listTrackByFn,
  cardTrackByFn,
} from '@app/utils/trackby-functions';

interface DialogData {
  cardId: string;
  listId: string;
  listTitle: string;
  isLastCardInList: boolean;
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
  @ViewChild('tagsMenuTrigger')
  tagsMenuTrigger: MatMenuTrigger;
  @ViewChild('attachmentMenuTrigger')
  attachmentMenuTrigger: MatMenuTrigger;
  @ViewChild('wallpaperMenuTrigger')
  wallpaperMenuTrigger: MatMenuTrigger;
  @ViewChild('membersMenuTrigger')
  membersMenuTrigger: MatMenuTrigger;
  @ViewChild('moveCardMenuTrigger')
  moveCardMenuTrigger: MatMenuTrigger;
  card: Card;
  currUser: User;
  boardTags: Tag[];
  boardMembers: User[];
  boardLists$: Observable<List[]>;
  selectedListId: string;
  selectedListCards: Card[];
  selectedListCardsSub: Subscription;
  selectedCardPosition: number;
  inProcessOfMovingCard: boolean = false;
  isDropAreaHovered: boolean;
  filesToUpload: File[] = [];
  cardSub: Subscription;
  userSub: Subscription;
  boardTagsSub: Subscription;
  boardMembersSub: Subscription;
  dialogOverlayWrapperElem: HTMLElement;
  memberTrackByFn = memberTrackByFn;
  tagTrackByFn = tagTrackByFn;
  trackByIndexFn = trackByIndexFn;
  listTrackByFn = listTrackByFn;
  cardTrackByFn = cardTrackByFn;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private cardDialogRef: MatDialogRef<CardDialogComponent>,
    private taskboardService: TaskboardService,
    private authService: AuthService,
    private afStorage: AngularFireStorage,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private renderer: Renderer2,
  ) {
    this.dialogOverlayWrapperElem = document.querySelector(
      'div.cdk-global-overlay-wrapper',
    );
  }

  ngOnInit(): void {
    const { listId, cardId } = this.data;
    this.renderer.addClass(
      this.dialogOverlayWrapperElem,
      'card-dialog-overlay',
    );
    this.cardSub = this.taskboardService
      .getCardData(listId, cardId)
      .subscribe((cardData: Card) => (this.card = cardData));
    this.userSub = this.authService
      .getUser()
      .subscribe((user: User) => (this.currUser = user));
    this.boardTagsSub = this.taskboardService
      .getBoardTags()
      .subscribe((boardTags: Tag[]) => (this.boardTags = boardTags));
    this.boardMembersSub = this.taskboardService
      .getBoardData()
      .subscribe((data: Board) => (this.boardMembers = data.members));
    this.boardLists$ = this.taskboardService.getBoardLists().pipe(
      tap((lists: List[]) => {
        const currList = lists.find(
          (list: List) => list.id === this.data.listId,
        );
        this.selectedListId = currList.id;
        this.loadSelectedListCards();
      }),
    );
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
          .removeCard(this.data.listId, cardId, this.data.isLastCardInList)
          .then(() => {
            this.cardDialogRef.close();
          })
          .catch((errMsg: string) => {
            this.snackBar.open(`❗${errMsg}❗`, 'OK');
          });
      });
  }

  cardHasTag(boardTagId: string): boolean {
    return this.card.tags.some((cardTag: Tag) => cardTag.id === boardTagId);
  }

  cardHasMember(boardMemberId: string): boolean {
    return this.card.members.some(
      (cardMember: User) => cardMember.id === boardMemberId,
    );
  }

  onChangeCardMemberState($event: MatSelectionListChange): void {
    const { listId, cardId } = this.data;
    const { value: memberId, selected } = $event.option;
    this.taskboardService.updateCardData(listId, cardId, {
      membersIds: selected
        ? firestore.FieldValue.arrayUnion(memberId)
        : firestore.FieldValue.arrayRemove(memberId),
    });
  }

  onTagNameEdit(oldName: string, newName: string, tagId: string): void {
    if (oldName !== newName) {
      this.taskboardService.updateBoardTagName(tagId, newName);
    }
  }

  onTagStateChange(tagId: string): void {
    if (this.cardHasTag(tagId)) {
      return this.removeTagFromCard(tagId);
    }
    this.addTagToCard(tagId);
  }

  addTagToCard(tagId: string): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      tagsIds: firestore.FieldValue.arrayUnion(tagId),
    });
  }

  removeTagFromCard(tagId: string): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      tagsIds: firestore.FieldValue.arrayRemove(tagId),
    });
  }

  onFilesUpload(files: FileList): void {
    this.attachmentMenuTrigger.closeMenu();
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      this.filesToUpload.push(file);
    }
  }

  onFileUploaded(attachment: CardAttachment, index: number): void {
    this.filesToUpload.splice(index, 1);
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      attachments: firestore.FieldValue.arrayUnion(attachment),
    });
  }

  toggleDropAreaHover(event: boolean): void {
    this.isDropAreaHovered = event;
  }

  attachmentIsImage(attachment: CardAttachment): boolean {
    return attachment.type.includes('image');
  }

  attachmentIsWallpaper(attachment: CardAttachment): boolean {
    return this.card.wallpaperURL === attachment.url;
  }

  getImageAttachments(): CardAttachment[] {
    return this.card.attachments.filter(this.attachmentIsImage);
  }

  removeCardAttachment(attachment: CardAttachment): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      attachments: firestore.FieldValue.arrayRemove(attachment),
    });
    this.afStorage.storage.refFromURL(attachment.url).delete();
    if (this.attachmentIsWallpaper(attachment)) {
      this.removeCardWallpaper();
    }
  }

  onSetCardWallpaper(attachment: CardAttachment): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      wallpaperURL: attachment.url,
    });
  }

  removeCardWallpaper(): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      wallpaperURL: '',
    });
  }

  loadSelectedListCards(): void {
    this.selectedListCardsSub = this.taskboardService
      .getListCards(this.selectedListId)
      .subscribe((selectedListCards: Card[]) => {
        this.selectedListCards = selectedListCards;
        const isOriginalList = this.data.listId === this.selectedListId;
        const currCard = selectedListCards.find(
          (card: Card) => card.id === this.card.id,
        );
        this.selectedCardPosition = isOriginalList
          ? currCard.positionNumber
          : selectedListCards.length + 1;
      });
  }

  onMoveCard(): void {
    this.inProcessOfMovingCard = true;
    if (this.selectedListId === this.data.listId) {
      moveItemInArray(
        this.selectedListCards,
        this.card.positionNumber - 1,
        this.selectedCardPosition - 1,
      );
      this.taskboardService
        .updateCardsPositionNumber(this.selectedListId, this.selectedListCards)
        .then(() => (this.inProcessOfMovingCard = false));
    } else {
      this.taskboardService
        .moveCardToAnotherList(
          this.data.listId,
          this.selectedListId,
          this.card.id,
          this.selectedCardPosition,
          this.data.isLastCardInList,
          this.selectedCardPosition === this.selectedListCards.length + 1,
        )
        .then(() => {
          this.inProcessOfMovingCard = false;
          this.moveCardMenuTrigger.closeMenu();
          this.cardDialogRef.close();
        });
    }
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(
      this.dialogOverlayWrapperElem,
      'card-dialog-overlay',
    );
    this.cardSub.unsubscribe();
    this.userSub.unsubscribe();
    this.boardTagsSub.unsubscribe();
    this.boardMembersSub.unsubscribe();
    if (this.selectedListCardsSub) this.selectedListCardsSub.unsubscribe();
  }
}
