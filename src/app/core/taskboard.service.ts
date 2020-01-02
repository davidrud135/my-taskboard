import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firestore } from 'firebase/app';
import {
  AngularFirestore,
  CollectionReference,
  AngularFirestoreDocument,
  Action,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { FirestoreBoard } from './models/firestore-board.model';
import { FirestoreList } from './models/firestore-list.model';
import { Board } from './models/board.model';
import { User } from './models/user.model';
import { List } from './models/list.model';

@Injectable({ providedIn: 'root' })
export class TaskboardService {
  private currUserId: string;
  private currBoardDoc: AngularFirestoreDocument<FirestoreBoard>;

  constructor(
    private afStore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authService
      .getUser()
      .pipe(filter((user: User | null) => user !== null))
      .subscribe((user: User) => (this.currUserId = user.id));
  }

  public setCurrBoardDoc(boardId: string): void {
    this.currBoardDoc = this.afStore.doc<Board>(`boards/${boardId}`);
  }

  public getPersonalBoards(): Observable<Board[]> {
    return this.authService.getUser().pipe(
      switchMap((user: User) => {
        if (!user) {
          return of(null);
        }
        return this.afStore
          .collection<FirestoreBoard>('boards', (ref: CollectionReference) =>
            ref.where('adminId', '==', user.id).orderBy('createdAt', 'desc'),
          )
          .valueChanges({ idField: 'id' });
      }),
    );
  }

  public createBoard(
    title: string,
    backgroundColor: string,
  ): Promise<firestore.DocumentReference> {
    return this.afStore.collection<FirestoreBoard>('boards').add({
      title,
      backgroundColor,
      adminId: this.currUserId,
      membersIds: [],
      createdAt: firestore.Timestamp.now(),
    });
  }

  public updateBoardData(data: Partial<FirestoreBoard>): Promise<void> {
    return this.currBoardDoc.update(data);
  }

  public getBoardData(): Observable<Board> {
    return this.currBoardDoc.snapshotChanges().pipe(map(this.getDocDataWithId));
  }

  public removeBoard(): Promise<void> {
    this.router.navigateByUrl('/boards');
    return this.currBoardDoc.delete();
  }

  public getBoardLists(): Observable<List[]> {
    return this.currBoardDoc
      .collection<FirestoreList>('lists', (ref: CollectionReference) =>
        ref.orderBy('createdAt'),
      )
      .valueChanges({ idField: 'id' });
  }

  public createList(listTitle: string): Promise<firestore.DocumentReference> {
    return this.currBoardDoc.collection<FirestoreList>('lists').add({
      title: listTitle,
      createdAt: firestore.Timestamp.now(),
    });
  }

  public updateListData(
    listId: string,
    data: Partial<FirestoreList>,
  ): Promise<void> {
    return this.currBoardDoc
      .collection('lists')
      .doc(listId)
      .update(data);
  }

  public removeList(listId: string): Promise<void> {
    return this.currBoardDoc
      .collection('lists')
      .doc(listId)
      .delete();
  }

  private getDocDataWithId(action: Action<DocumentSnapshot<any>>): any {
    const { payload } = action;
    const id = payload.id;
    const data = payload.data();
    return { id, ...data };
  }
}
