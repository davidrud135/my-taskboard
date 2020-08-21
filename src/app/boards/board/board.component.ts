// tslint:disable: align
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Validators, FormControl } from '@angular/forms';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { environment } from '@env/environment';
import { TaskboardService } from '@core/taskboard.service';
import { AuthService } from '@app/auth/auth.service';
import { Board } from '@core/models/board.model';
import { List } from '@core/models/list.model';
import { User } from '@core/models/user.model';
import { BoardBackColor } from '@core/models/board-back-color.model';
import { noEmptyValueValidator } from '@app/utils/no-empty-value.validator';
import { RemovalConfirmDialogComponent } from '@components/removal-confirm-dialog/removal-confirm-dialog.component';
import { listTrackByFn, memberTrackByFn } from '@app/utils/trackby-functions';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board;
  boardTitleControl: FormControl;
  newMemberNameControl: FormControl;
  @ViewChild('newListTitleField')
  newListTitleField: ElementRef;
  @ViewChild(MatMenuTrigger)
  menuTrigger: MatMenuTrigger;
  lists$: Observable<List[]>;
  isNewListTemplateOpened = false;
  mobileQuery: MediaQueryList;
  mobileMediaListener: any;
  isBoardBackColorsBlockOpened = false;
  boardBackColors: string[];
  currUser: User;
  listTrackByFn = listTrackByFn;
  memberTrackByFn = memberTrackByFn;

  constructor(
    private taskboardService: TaskboardService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 599px)');
    this.mobileMediaListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileMediaListener);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const { id } = params;
      this.taskboardService.setCurrBoardDoc(id);
      this.taskboardService.getBoardData().subscribe((boardData: Board) => {
        this.board = boardData;
        this.boardTitleControl = new FormControl(
          boardData.title,
          Validators.required,
        );
        this.titleService.setTitle(
          `${boardData.title} | ${environment.projectTitle}`,
        );
      });
      this.lists$ = this.taskboardService.getBoardLists();
    });
    this.authService
      .getUser()
      .pipe(filter((user: User | null) => !!user))
      .subscribe((user: User) => (this.currUser = user));
    this.boardBackColors = Object.values(BoardBackColor);
    this.newMemberNameControl = new FormControl('', [
      Validators.required,
      noEmptyValueValidator,
      this.newMemberValidator,
    ]);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileMediaListener);
  }

  onEditBoardTitle(oldBoardTitle: string): void {
    const newBoardTitle = this.boardTitleControl.value.trim();
    if (this.boardTitleControl.invalid || newBoardTitle === oldBoardTitle) {
      return this.boardTitleControl.setValue(oldBoardTitle);
    }
    this.taskboardService.updateBoardData({ title: newBoardTitle });
  }

  openNewListTemplate(): void {
    this.isNewListTemplateOpened = true;
    setTimeout(() => {
      const { nativeElement } = this.newListTitleField;
      nativeElement.focus();
      nativeElement.style.height = '18px';
    }, 50);
  }

  closeNewListTemplate() {
    this.isNewListTemplateOpened = false;
    this.newListTitleField.nativeElement.value = '';
  }

  onAddListToBoard() {
    const newListTitle = this.newListTitleField.nativeElement.value.trim();
    if (!newListTitle) return;
    this.taskboardService.createList(newListTitle);
    this.closeNewListTemplate();
  }

  openBoardRemovalConfirmDialog(boardTitle: string) {
    this.dialog
      .open(RemovalConfirmDialogComponent, {
        data: {
          headerTitle: boardTitle,
          bodyText:
            'Are you sure you want to remove the board and all its lists?',
        },
      })
      .afterClosed()
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          this.taskboardService.removeBoard();
        }
      });
  }

  toggleBoardBackColorBlock(): void {
    this.isBoardBackColorsBlockOpened = !this.isBoardBackColorsBlockOpened;
  }

  onChangeBoardBackColor(
    currBoardBackColor: string,
    newBoardBackColor: string,
  ): void {
    if (currBoardBackColor !== newBoardBackColor) {
      this.taskboardService.updateBoardData({
        backgroundColor: newBoardBackColor,
      });
    }
  }

  isBoardAdmin(adminId: string, memberId: string): boolean {
    return adminId === memberId;
  }

  onAddNewMember(): void {
    if (this.newMemberNameControl.invalid) return;
    const newMemberUsername = this.newMemberNameControl.value.trim();
    this.taskboardService
      .addMemberToBoard(newMemberUsername)
      .then(() => {
        this.newMemberNameControl.reset();
        this.menuTrigger.closeMenu();
      })
      .catch((errMsg: string) => {
        this.snackBar.open(`⚠️${errMsg}⚠️`, 'OK', {
          duration: 7000,
          horizontalPosition: 'left',
          verticalPosition: 'top',
        });
      });
  }

  onRemoveMember(memberId: string): void {
    this.taskboardService.removeMemberFromBoard(memberId);
  }

  changeBoardFavor(): void {
    this.isUsersFavoriteBoard()
      ? this.taskboardService.removeBoardFromFavorites()
      : this.taskboardService.addBoardToFavorites();
  }

  isUsersFavoriteBoard(): boolean {
    return this.board.usersIdsWhoseBoardIsFavorite.includes(this.currUser.id);
  }

  // tslint:disable: semicolon
  newMemberValidator = (control: FormControl): object | null => {
    const controlValue = control.value;
    if (controlValue) {
      control.markAsTouched();
      const newMemberUsername = controlValue.trim();
      if (newMemberUsername === this.currUser.username) {
        return { selfInvitation: true };
      }
      const isAlreadyMember = this.board.members.find(
        (user: User) => user.username === newMemberUsername,
      );
      if (isAlreadyMember) {
        return { alreadyMember: true };
      }
      return null;
    }
  };
}
