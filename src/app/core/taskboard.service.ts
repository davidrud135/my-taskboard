import { Injectable } from '@angular/core';
import { firestore } from 'firebase/app';

import { Board } from './models/board.model';
import { BoardBackColor } from './models/board-back-color.model';

@Injectable({ providedIn: 'root' })
export class TaskboardService {
  getBoards(): Board[] {
    const boards: Board[] = [];
    Object.values(BoardBackColor).forEach((color: string, i: number) => {
      boards.push({
        id: `${i}`,
        title: `Board #${i + 1}`,
        adminId: `user${i}`,
        membersIds: [],
        backgroundColor: color,
        createdAt: firestore.Timestamp.now(),
      });
    });
    return boards;
  }
}
