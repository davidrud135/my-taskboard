import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Validators, FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

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
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board;
  boardSub: Subscription;
  currUser: User;
  lists$: Observable<List[]>;
  isFavoriteBoard = false;
  isNewListPanelOpened = false;
  boardTitleControl: FormControl;
  newMemberNameControl: FormControl;
  newListTitleControl: FormControl;
  @ViewChild(MatMenuTrigger)
  newMemberMenuTrigger: MatMenuTrigger;
  boardBackColors: string[];
  listTrackByFn = listTrackByFn;
  memberTrackByFn = memberTrackByFn;

  constructor(
    private taskboardService: TaskboardService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private titleService: Title,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.boardSub = this.route.params
      .pipe(
        map(params => params['id']),
        tap((boardId: string) => {
          this.taskboardService.setCurrBoardDoc(boardId);
          this.lists$ = this.taskboardService.getBoardLists();
        }),
        switchMap(() =>
          combineLatest([
            this.taskboardService.getBoardData(),
            this.authService.getUser(),
          ]),
        ),
      )
      .subscribe((data: [Board, User]) => {
        const [boardData, currUser] = data;
        const { title } = boardData;
        this.board = boardData;
        this.currUser = currUser;
        this.isFavoriteBoard = boardData.usersIdsWhoseBoardIsFavorite.includes(
          currUser.id,
        );
        this.boardTitleControl.setValue(title);
        this.titleService.setTitle(`${title} | ${environment.projectTitle}`);
      });
    this.initControls();
    this.boardBackColors = Object.values(BoardBackColor);
  }

  initControls(): void {
    this.boardTitleControl = new FormControl(null, [
      Validators.required,
      noEmptyValueValidator,
    ]);
    this.newListTitleControl = new FormControl(null, [
      Validators.required,
      noEmptyValueValidator,
    ]);
    this.newMemberNameControl = new FormControl(null, [
      Validators.required,
      noEmptyValueValidator,
      this.newMemberValidator,
    ]);
  }

  get isCurrUserBoardAdmin(): boolean {
    return this.currUser.id === this.board.adminId;
  }

  onEditBoardTitle(prevBoardTitle: string): void {
    const newBoardTitle = this.boardTitleControl.value.trim();
    if (this.boardTitleControl.invalid || newBoardTitle === prevBoardTitle) {
      return this.boardTitleControl.setValue(prevBoardTitle);
    }
    this.taskboardService.updateBoardData({ title: newBoardTitle });
  }

  openNewListPanel(): void {
    this.isNewListPanelOpened = true;
  }

  closeNewListPanel(): void {
    this.newListTitleControl.reset();
    this.isNewListPanelOpened = false;
  }

  onAddListToBoard(): void {
    const newListTitle = this.newListTitleControl.value.trim();
    if (!newListTitle) return;
    this.taskboardService.createList(newListTitle);
    this.closeNewListPanel();
  }

  openBoardRemovalConfirmDialog(boardTitle: string): void {
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

  onChangeBoardBackColor(
    currBoardBackColor: string,
    newBoardBackColor: string,
  ): void {
    if (currBoardBackColor === newBoardBackColor) return;
    this.taskboardService.updateBoardData({
      backgroundColor: newBoardBackColor,
    });
  }

  onAddNewMember(): void {
    if (this.newMemberNameControl.invalid) return;
    const newMemberUsername = this.newMemberNameControl.value.trim();
    this.taskboardService
      .addMemberToBoard(newMemberUsername)
      .then(() => {
        this.newMemberNameControl.reset();
        this.newMemberMenuTrigger.closeMenu();
      })
      .catch((errMsg: string) => {
        this.snackBar.open(errMsg, 'OK', {
          panelClass: 'snackbar-error',
        });
      });
  }

  onRemoveMember(memberId: string): void {
    this.taskboardService.removeMemberFromBoard(memberId);
  }

  onChangeBoardFavor(): void {
    this.isFavoriteBoard
      ? this.taskboardService.removeBoardFromFavorites()
      : this.taskboardService.addBoardToFavorites();
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
      return isAlreadyMember ? { alreadyMember: true } : null;
    }
  };

  ngOnDestroy(): void {
    this.boardSub.unsubscribe();
  }
}
