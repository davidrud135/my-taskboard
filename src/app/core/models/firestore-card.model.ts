// tslint:disable: max-line-length
import { firestore } from 'firebase/app';

/**
 * Defines model for Card data in Firestore.
 * @property {string} title - card title.
 * @property {string} description - card description.
 * @property {string} creatorId - card creator id.
 * @property {string[]} usersIdsWhoVoted - array of user's ids who have voted for the card.
 * @property {firestore.Timestamp} createdAt - timestamp when card was created.
 */
export interface FirestoreCard {
  title: string;
  description: string;
  creatorId: string;
  usersIdsWhoVoted: any;
  createdAt: firestore.Timestamp;
}
