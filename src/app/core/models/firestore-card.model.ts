// tslint:disable: max-line-length
import { firestore } from 'firebase/app';

/**
 * Defines model for Card data in Firestore.
 * @property {string} title - card title.
 * @property {string} description - card description.
 * @property {number} positionNumber - card's position number in list. Starts from 1.
 * @property {string} creatorId - card creator id.
 * @property {string[]} membersIds - array of card members' ids.
 * @property {string[]} usersIdsWhoVoted - array of user's ids who have voted for the card.
 * @property {string[]} tagsIds - array of card tag's ids.
 * @property {CardAttachment[]} attachments - array of card's attachments.
 * @property {string} wallpaperURL - card's wallpaper URL.
 * @property {firestore.Timestamp} createdAt - timestamp when card was created.
 */
export interface FirestoreCard {
  title: string;
  description: string;
  positionNumber: number;
  creatorId: string;
  membersIds: any;
  usersIdsWhoVoted: any;
  tagsIds: any;
  attachments: any;
  wallpaperURL: string;
  createdAt: firestore.Timestamp;
}
