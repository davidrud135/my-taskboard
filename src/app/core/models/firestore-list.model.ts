import { firestore } from 'firebase/app';

/**
 * Defines model for List data in Firestore.
 * @property {string} title - list's title.
 * @property {firestore.Timestamp} createdAt - timestamp when list was created.
 */
export interface FirestoreList {
  title: string;
  createdAt: firestore.Timestamp;
}
