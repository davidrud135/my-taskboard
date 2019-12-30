import { firestore } from 'firebase/app';

/**
 * Defines model for Card data in Firestore.
 * @property {string} title - card title.
 * @property {string} description - card description.
 * @property {firestore.Timestamp} createdAt - timestamp when card was created.
 */
export interface FirestoreCard {
  title: string;
  description: string;
  createdAt: firestore.Timestamp;
}
