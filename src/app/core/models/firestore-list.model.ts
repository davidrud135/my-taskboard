import { firestore } from 'firebase/app';

/**
 * Defines model for List data in Firestore.
 * @property {string} title - list's title.
 * @property {string} creatorId - list's creator id.
 * @property {firestore.Timestamp} createdAt - timestamp when list was created.
 */
export interface FirestoreList {
  title: string;
  creatorId: string;
  createdAt: firestore.Timestamp;
}
