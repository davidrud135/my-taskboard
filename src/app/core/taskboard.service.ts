import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firestore } from 'firebase/app';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  Action,
  DocumentSnapshot,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { FirestoreBoard } from './models/firestore-board.model';
import { FirestoreList } from './models/firestore-list.model';
import { Board } from './models/board.model';
import { User } from './models/user.model';
import { List } from './models/list.model';
import { FirestoreCard } from './models/firestore-card.model';
import { Card } from './models/card.model';
import { FirestoreUser } from './models/firestore-user.model';
import { FirestoreTag } from './models/firestore-tag.model';
import { Tag } from './models/tag.model';
import { BoardBackColor } from './models/board-back-color.model';

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
    this.currBoardDoc = this.afStore.doc<FirestoreBoard>(`boards/${boardId}`);
  }

  public getPersonalBoards(): Observable<(FirestoreBoard & { id: string })[]> {
    return this.authService.getUser().pipe(
      switchMap((user: User) => {
        if (!user) {
          return of(null);
        }
        return this.afStore
          .collection<FirestoreBoard>('boards', (ref: CollectionReference) =>
            ref
              .where('membersIds', 'array-contains', user.id)
              .orderBy('createdAt', 'desc'),
          )
          .valueChanges({ idField: 'id' });
      }),
    );
  }

  public getFavoriteBoards(): Observable<(FirestoreBoard & { id: string })[]> {
    return this.authService.getUser().pipe(
      switchMap((user: User) => {
        if (!user) {
          return of(null);
        }
        return this.afStore
          .collection<FirestoreBoard>('boards', (ref: CollectionReference) =>
            ref
              .where('usersIdsWhoseBoardIsFavorite', 'array-contains', user.id)
              .orderBy('createdAt', 'desc'),
          )
          .valueChanges({ idField: 'id' });
      }),
    );
  }

  public async createBoard(
    title: string,
    backgroundColor: string,
  ): Promise<firestore.DocumentReference> {
    const boardDoc = await this.afStore
      .collection<FirestoreBoard>('boards')
      .add({
        title,
        backgroundColor,
        adminId: this.currUserId,
        membersIds: [this.currUserId],
        createdAt: firestore.Timestamp.now(),
        usersIdsWhoseBoardIsFavorite: [],
      });
    Object.values(BoardBackColor).forEach((color: string) => {
      boardDoc.collection('tags').add({
        color,
        name: '',
      });
    });
    return boardDoc;
  }

  public updateBoardData(data: Partial<FirestoreBoard>): Promise<void> {
    return this.currBoardDoc.update(data);
  }

  public async addMemberToBoard(
    newMemberUsername: string,
  ): Promise<string | void> {
    const snapshot: firestore.QuerySnapshot = await this.afStore
      .collection('users', (ref: CollectionReference) =>
        ref.where('username', '==', newMemberUsername),
      )
      .get()
      .toPromise();
    if (snapshot.empty) {
      return Promise.reject(`User (${newMemberUsername}) was not found`);
    }
    const newMemberId = snapshot.docs[0].id;
    return this.updateBoardData({
      membersIds: firestore.FieldValue.arrayUnion(newMemberId),
    });
  }

  public removeMemberFromBoard(memberId: string): Promise<void> {
    if (memberId === this.currUserId) {
      this.router.navigateByUrl('/boards');
    }
    return this.updateBoardData({
      membersIds: firestore.FieldValue.arrayRemove(memberId),
    });
  }

  public getBoardData(): Observable<Board> {
    let boardData;
    return this.currBoardDoc.snapshotChanges().pipe(
      map(this.getDocDataWithId),
      switchMap((firestoreBoard: FirestoreBoard & { id: string }) => {
        const { membersIds, ...board } = firestoreBoard;
        boardData = board;
        const members$: Observable<User>[] = membersIds.map((userId: string) =>
          this.afStore
            .doc<FirestoreUser>(`users/${userId}`)
            .snapshotChanges()
            .pipe(map(this.getDocDataWithId)),
        );
        return combineLatest(members$);
      }),
      map((members: User[]) => {
        return { members, ...boardData };
      }),
    );
  }

  public getBoardTags(): Observable<Tag[]> {
    return this.currBoardDoc
      .collection<FirestoreTag>('tags')
      .valueChanges({ idField: 'id' });
  }

  public updateBoardTagName(tagId: string, newTagName: string): Promise<void> {
    return this.currBoardDoc
      .collection('tags')
      .doc<FirestoreTag>(tagId)
      .update({
        name: newTagName,
      });
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
      creatorId: this.currUserId,
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

  addBoardToFavorites(): Promise<void> {
    return this.updateBoardData({
      usersIdsWhoseBoardIsFavorite: firestore.FieldValue.arrayUnion(
        this.currUserId,
      ),
    });
  }

  removeBoardFromFavorites(): Promise<void> {
    return this.updateBoardData({
      usersIdsWhoseBoardIsFavorite: firestore.FieldValue.arrayRemove(
        this.currUserId,
      ),
    });
  }

  public async removeList(
    listId: string,
    listCreatorId?: string,
  ): Promise<string | void> {
    if (listCreatorId !== this.currUserId) {
      return Promise.reject(
        'Only admin or creator have permission to delete this list.',
      );
    }
    await this.removeAllListCards(listId).catch(() =>
      Promise.reject("Can't delete list since it has other members cards."),
    );
    return this.currBoardDoc
      .collection('lists')
      .doc(listId)
      .delete();
  }

  // Card methods

  public getCardData(listId: string, cardId: string): Observable<Card> {
    let cardData: any;
    return this.currBoardDoc
      .collection(`lists/${listId}/cards`)
      .doc<FirestoreCard>(cardId)
      .snapshotChanges()
      .pipe(
        map(this.getDocDataWithId),
        switchMap((firestoreCard: FirestoreCard) => {
          const { tagsIds, membersIds, ...card } = firestoreCard;
          cardData = card;
          const tagsArray$: Observable<Tag>[] = tagsIds.map((tagId: string) => {
            return this.currBoardDoc
              .collection('tags')
              .doc<FirestoreTag>(tagId)
              .snapshotChanges()
              .pipe(map(this.getDocDataWithId));
          });
          const membersArray$: Observable<User>[] = membersIds.map(
            (userId: string) => {
              return this.afStore
                .collection('users')
                .doc<FirestoreUser>(userId)
                .snapshotChanges()
                .pipe(map(this.getDocDataWithId));
            },
          );
          const tags$: Observable<Tag[]> = tagsArray$.length
            ? combineLatest(tagsArray$)
            : of([]);
          const members$: Observable<User[]> = membersArray$.length
            ? combineLatest(membersArray$)
            : of([]);
          return combineLatest(tags$, members$);
        }),
        map((transformedData: any[]) => {
          const [tags, members] = transformedData;
          return { tags, members, ...cardData };
        }),
      );
  }

  public getListCards(listId: string): Observable<Card[]> {
    return this.currBoardDoc
      .collection<FirestoreCard>(`lists/${listId}/cards`)
      .valueChanges({ idField: 'id' })
      .pipe(
        switchMap((cards: (FirestoreCard & { id: string })[]) => {
          const cards$ = cards.map((card: FirestoreCard & { id: string }) =>
            this.getCardData(listId, card.id),
          );
          return cards$.length ? combineLatest(cards$) : of([]);
        }),
      );
  }

  // public getListCards(
  //   listId: string,
  //   listSortingStrategy$: Observable<ListSorting>,
  // ): Observable<(FirestoreCard & { id: string })[]> {
  //   return listSortingStrategy$.pipe(
  //     switchMap((sorting: ListSorting) => {
  //       return this.currBoardDoc
  //         .collection<FirestoreCard>(
  //           `lists/${listId}/cards`,
  //           (ref: CollectionReference) => {
  //             switch (sorting) {
  //               case 'asc':
  //                 return ref.orderBy('createdAt');
  //               case 'desc':
  //                 return ref.orderBy('createdAt', 'desc');
  //               default:
  //                 return ref.orderBy('title');
  //             }
  //           },
  //         )
  //         .valueChanges({ idField: 'id' });
  //     }),
  //   );
  // }

  public createCard(
    listId: string,
    title: string,
  ): Promise<firestore.DocumentReference> {
    return this.currBoardDoc
      .collection<FirestoreCard>(`lists/${listId}/cards`)
      .add({
        title,
        description: '',
        creatorId: this.currUserId,
        membersIds: [],
        usersIdsWhoVoted: [],
        tagsIds: [],
        attachments: [],
        wallpaperURL: '',
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
      .delete()
      .catch((err: firestore.FirestoreError) => {
        if (err.code === 'permission-denied') {
          return Promise.reject(
            'Only admin or creator have permission to delete this card.',
          );
        }
      });
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

  private async removeAllListCards(listId: string): Promise<void> {
    const cardsQuerySnapshot: firestore.QuerySnapshot = await this.currBoardDoc
      .collection(`lists/${listId}/cards`)
      .ref.get();
    const { docs } = cardsQuerySnapshot;
    const hasPermissionToDelete = docs.every(
      (cardSnapshot: firestore.QueryDocumentSnapshot) => {
        const cardData: DocumentData = cardSnapshot.data();
        return cardData['creatorId'] === this.currUserId;
      },
    );
    if (!hasPermissionToDelete) return Promise.reject();
    for (const cardDocSnapshot of docs) {
      const cardToDeleteData = cardDocSnapshot.data();
      // await cardDocSnapshot.ref.delete();
    }
  }

  private getDocDataWithId(action: Action<DocumentSnapshot<any>>): any {
    const { payload } = action;
    const id = payload.id;
    const data = payload.data();
    return { id, ...data };
  }
}
