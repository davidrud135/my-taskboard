// tslint:disable: max-line-length
import { firestore } from 'firebase/app';

/**
 * Defines interface for Board in Firestore.
 * @property {string} title - title of the board.
 * @property {string} adminId - id of user who created the board.
 * @property {string[]} membersIds - list of board members id.
 * @property {string} backgroundColor - background color of the board.
 * @property {firestore.Timestamp} createdAt - timestamp when the board was created.
 */
export interface FirestoreBoard {
  title: string;
  adminId: string;
  membersIds: string[];
  backgroundColor: string;
  createdAt: firestore.Timestamp;
}