import { FirestoreBoard } from './firestore-board.model';

/**
 * Defines interface for Board.
 * @extends {FirestoreBoard}.
 * @property {string} id - unique id of the board.
 */
export interface Board extends FirestoreBoard {
  id: string;
}
