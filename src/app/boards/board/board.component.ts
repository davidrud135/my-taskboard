// tslint:disable: align
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';

import { environment } from './../../../environments/environment.prod';
import { Board } from './../../core/models/board.model';
import { TaskboardService } from './../../core/taskboard.service';
import { List } from './../../core/models/list.model';
import { RemovalConfirmDialogComponent } from './../../core/components/removal-confirm-dialog/removal-confirm-dialog.component';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @ViewChild('boardTitleField', { static: false })
  boardTitleField: ElementRef;
  @ViewChild('newListTitleField', { static: false })
  newListTitleField: ElementRef;
  board$: Observable<Board>;
  lists: List[];
  isNewListTemplateOpened = false;
  mobileQuery: MediaQueryList;

  constructor(
    private taskboardService: TaskboardService,
    private route: ActivatedRoute,
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
    public dialog: MatDialog,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 599px)');
    this.mobileQuery.addListener(() => changeDetectorRef.detectChanges());
  }

  ngOnInit() {
    this.lists = [];
    this.route.params.subscribe((params: Params) => {
      const { id } = params;
      this.taskboardService.setCurrBoardDoc(id);
      this.board$ = this.taskboardService.getBoardData().pipe(
        tap((board: Board) => {
          this.titleService.setTitle(
            `${board.title} | ${environment.projectTitle}`,
          );
        }),
      );
    });
  }

  onEditBoardTitle(oldBoardTitle: string): void {
    const { nativeElement } = this.boardTitleField;
    const newBoardTitle = nativeElement.value.trim();
    if (!newBoardTitle || oldBoardTitle === newBoardTitle) {
      nativeElement.value = oldBoardTitle;
      return;
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

  onAddListToBoard(boardId: string) {
    const newListTitle = this.newListTitleField.nativeElement.value.trim();
    if (!newListTitle) return;
    console.log(`Add list '${newListTitle}' to board with id ${boardId}`);
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
}
