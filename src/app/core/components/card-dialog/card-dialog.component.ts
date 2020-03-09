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
import { MatMenuTrigger } from '@angular/material/menu';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase/app';
import { Subscription } from 'rxjs';

import { TaskboardService } from './../../taskboard.service';
import { AuthService } from './../../../auth/auth.service';
import { User } from '../../models/user.model';
import { Card } from './../../models/card.model';
import { RemovalConfirmDialogComponent } from './../removal-confirm-dialog/removal-confirm-dialog.component';
import { Tag } from '../../models/tag.model';
import { CardAttachment } from './../../models/card-attachment.model';

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
  @ViewChild('tagsMenuTrigger')
  tagsMenuTrigger: MatMenuTrigger;
  @ViewChild('attachmentMenuTrigger')
  attachmentMenuTrigger: MatMenuTrigger;
  @ViewChild('wallpaperMenuTrigger')
  wallpaperMenuTrigger: MatMenuTrigger;
  card: Card;
  currUser: User;
  boardTags: Tag[];
  isDropAreaHovered: boolean;
  filesToUpload: File[] = [];
  cardSub: Subscription;
  userSub: Subscription;
  boardTagsSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private cardDialogRef: MatDialogRef<CardDialogComponent>,
    private taskboardService: TaskboardService,
    private authService: AuthService,
    private afStorage: AngularFireStorage,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const { listId, cardId } = this.data;
    this.cardSub = this.taskboardService
      .getCardData(listId, cardId)
      .subscribe((cardData: Card) => (this.card = cardData));
    this.userSub = this.authService
      .getUser()
      .subscribe((user: User) => (this.currUser = user));
    this.boardTagsSub = this.taskboardService
      .getBoardTags()
      .subscribe((boardTags: Tag[]) => (this.boardTags = boardTags));
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

  cardHasTag(tagId: string): boolean {
    return this.card.tags.some((cardTag: Tag) => cardTag.id === tagId);
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

  getReadableAttachmentSize(attachment: CardAttachment): string {
    const megabyteSize = 1000000;
    const kilobyteSize = 1000;
    const { size } = attachment;
    if (size >= megabyteSize) {
      const sizeInMegabytes = (size / megabyteSize).toFixed(1);
      return `${sizeInMegabytes} MB`;
    }
    const sizeInKilobytes = (size / kilobyteSize).toFixed(1);
    return `${sizeInKilobytes} KB`;
  }

  getReadableAttachmentTimestamp(attachment: CardAttachment): string {
    const formattingOptions = {
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: 'numeric',
    };
    return attachment.attachedAt
      .toDate()
      .toLocaleDateString('en-US', formattingOptions);
  }

  removeCardAttachment(attachment: CardAttachment): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      attachments: firestore.FieldValue.arrayRemove(attachment),
    });
    this.afStorage.storage.refFromURL(attachment.url).delete();
  }

  onSetCardWallpaper(attachment: CardAttachment): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      wallpaperURL: attachment.url,
    });
  }

  onWallpaperRemove(): void {
    const { listId, cardId } = this.data;
    this.taskboardService.updateCardData(listId, cardId, {
      wallpaperURL: '',
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.cardSub.unsubscribe();
  }
}
