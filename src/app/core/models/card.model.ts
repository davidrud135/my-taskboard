// tslint:disable: max-line-length
import { firestore } from 'firebase/app';
import { Tag } from './tag.model';
import { CardAttachment } from './card-attachment.model';
import { User } from './user.model';

/**
 * Defines model for Card data.
 * @property {string} id - card's unique id.
 * @property {string} title - card title.
 * @property {string} description - card description.
 * @property {number} positionNumber - card's position number in list. Starts from 1.
 * @property {string} creatorId - card creator id.
 * @property {User} members - array of card's members.
 * @property {string[]} usersIdsWhoVoted - array of user's ids who have voted for the card.
 * @property {Tag[]} tagsIds - array of card's tags.
 * @property {CardAttachment[]} attachments - array of card's attachments.
 * @property {string} wallpaperURL - card's wallpaper URL.
 * @property {firestore.Timestamp} createdAt - timestamp when card was created.
 */
export interface Card {
  id: string;
  title: string;
  description: string;
  positionNumber: number;
  creatorId: string;
  members: User[];
  usersIdsWhoVoted: string[];
  tags: Tag[];
  attachments: CardAttachment[];
  wallpaperURL: string;
  createdAt: firestore.Timestamp;
}
