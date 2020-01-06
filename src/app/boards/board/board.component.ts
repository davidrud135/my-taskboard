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
import { Validators, FormControl } from '@angular/forms';
import { MediaMatcher } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from './../../../environments/environment.prod';
import { Board } from './../../core/models/board.model';
import { TaskboardService } from './../../core/taskboard.service';
import { List } from './../../core/models/list.model';
import { RemovalConfirmDialogComponent } from './../../core/components/removal-confirm-dialog/removal-confirm-dialog.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  boardTitleControl: FormControl;
  @ViewChild('newListTitleField', { static: false })
  newListTitleField: ElementRef;
  board$: Observable<Board>;
  lists$: Observable<List[]>;
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
    this.route.params.subscribe((params: Params) => {
      const { id } = params;
      this.taskboardService.setCurrBoardDoc(id);
      this.board$ = this.taskboardService.getBoardData().pipe(
        tap((board: Board) => {
          this.boardTitleControl = new FormControl(
            board.title,
            Validators.required,
          );
          this.titleService.setTitle(
            `${board.title} | ${environment.projectTitle}`,
          );
        }),
      );
      this.lists$ = this.taskboardService.getBoardLists();
    });
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
}
