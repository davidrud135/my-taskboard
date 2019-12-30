import { Injectable } from '@angular/core';
import { firestore } from 'firebase/app';

import { Board } from './models/board.model';
import { BoardBackColor } from './models/board-back-color.model';
import { List } from './models/list.model';
import { Card } from './models/card.model';

@Injectable({ providedIn: 'root' })
export class TaskboardService {
  boards: Board[] = [];

  constructor() {
    Object.values(BoardBackColor).forEach((color: string, i: number) => {
      this.boards.push({
        id: `${i}`,
        title: `Board #${i + 1}`,
        adminId: `user${i}`,
        membersIds: [],
        backgroundColor: color,
        createdAt: firestore.Timestamp.now(),
      });
    });
  }

  public getBoards(): Board[] {
    return this.boards;
  }

  public getBoardData(boardId: string): Board {
    return this.boards.find((board: Board) => board.id === boardId);
  }

  public getBoardLists(boardId: string): List[] {
    const lists: List[] = [];
    for (let i = 0; i < 10; i += 1) {
      const list: List = {
        id: `${i}`,
        title: `List ${i}`,
        cards: this.getListCards(`${i}`),
        createdAt: firestore.Timestamp.now(),
      };
      lists.push(list);
    }
    return lists;
  }

  private getListCards(listId: string): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < 15; i += 1) {
      const card: Card = {
        id: `${i}`,
        title: `Card ${i}`,
        description: `Description of the card #${i}`,
        createdAt: firestore.Timestamp.now(),
      };
      cards.push(card);
    }
    return cards;
  }
}
