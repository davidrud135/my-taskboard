// tslint:disable: max-line-length
import { firestore } from 'firebase/app';
import { User } from './user.model';

/**
 * Defines interface for Board object.
 * @property {string} id - unique id of the board.
 * @property {string} title - title of the board.
 * @property {string} adminId - id of the board's creator.
 * @property {User[]} members - array of users who are members of the board.
 * @property {string} backgroundColor - background color of the board.
 * @property {string[]} usersIdsWhoseBoardIsFavorite - list of user's ids who marked the board as favorite.
 * @property {firestore.Timestamp} createdAt - timestamp when the board was created.
 */
export interface Board {
  id: string;
  title: string;
  adminId: string;
  members: User[];
  backgroundColor: string;
  usersIdsWhoseBoardIsFavorite: any;
  createdAt: firestore.Timestamp;
}
