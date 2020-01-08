import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firestore } from 'firebase/app';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  Action,
  DocumentSnapshot,
  CollectionReference,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { FirestoreBoard } from './models/firestore-board.model';
import { FirestoreList } from './models/firestore-list.model';
import { Board } from './models/board.model';
import { User } from './models/user.model';
import { List } from './models/list.model';
import { FirestoreCard } from './models/firestore-card.model';
import { Card } from './models/card.model';
import { ListSorting } from './models/list-sorting.model';

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

  // Board methods

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

  public async removeBoard(): Promise<void> {
    this.router.navigateByUrl('/boards');
    await this.removeAllBoardLists();
    return this.currBoardDoc.delete();
  }

  // List methods

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

  public async removeList(listId: string): Promise<void> {
    await this.removeAllListCards(listId);
    return this.currBoardDoc
      .collection('lists')
      .doc(listId)
      .delete();
  }

  // Card methods

  public getCardData(listId: string, cardId: string): Observable<Card> {
    return this.currBoardDoc
      .collection(`lists/${listId}/cards`)
      .doc<FirestoreCard>(cardId)
      .snapshotChanges()
      .pipe(map(this.getDocDataWithId));
  }

  public getListCards(
    listId: string,
    listSortingStrategy$: Observable<ListSorting>,
  ): Observable<Card[]> {
    return listSortingStrategy$.pipe(
      switchMap((sorting: ListSorting) => {
        return this.currBoardDoc
          .collection<FirestoreCard>(
            `lists/${listId}/cards`,
            (ref: CollectionReference) => {
              switch (sorting) {
                case 'asc':
                  return ref.orderBy('createdAt');
                case 'desc':
                  return ref.orderBy('createdAt', 'desc');
                default:
                  return ref.orderBy('title');
              }
            },
          )
          .valueChanges({ idField: 'id' });
      }),
    );
  }

  public createCard(
    listId: string,
    title: string,
  ): Promise<firestore.DocumentReference> {
    return this.currBoardDoc
      .collection<FirestoreCard>(`lists/${listId}/cards`)
      .add({
        title,
        description: '',
        createdAt: firestore.Timestamp.now(),
      });
  }

  public updateCardData(
    listId: string,
    cardId: string,
    data: Partial<FirestoreCard>,
  ): Promise<void> {
    return this.currBoardDoc
      .collection(`lists/${listId}/cards`)
      .doc(cardId)
      .update(data);
  }

  public removeCard(listId: string, cardId: string): Promise<void> {
    return this.currBoardDoc
      .collection(`lists/${listId}/cards`)
      .doc(cardId)
      .delete();
  }

  // Additional methods

  private async removeAllBoardLists(): Promise<void> {
    const listsQuerySnapshot: firestore.QuerySnapshot = await this.currBoardDoc
      .collection('lists')
      .ref.get();
    for (const listDocSnapshot of listsQuerySnapshot.docs) {
      await this.removeList(listDocSnapshot.id);
    }
  }

  private async removeAllListCards(listId): Promise<void> {
    const cardsQuerySnapshot: firestore.QuerySnapshot = await this.currBoardDoc
      .collection(`lists/${listId}/cards`)
      .ref.get();
    for (const cardDocSnapshot of cardsQuerySnapshot.docs) {
      await cardDocSnapshot.ref.delete();
    }
  }

  private getDocDataWithId(action: Action<DocumentSnapshot<any>>): any {
    const { payload } = action;
    const id = payload.id;
    const data = payload.data();
    return { id, ...data };
  }
}
