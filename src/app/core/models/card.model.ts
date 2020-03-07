// tslint:disable: max-line-length
import { firestore } from 'firebase/app';
import { Tag } from './tag.model';
import { CardAttachment } from './card-attachment.model';

/**
 * Defines model for Card data.
 * @property {string} id - card's unique id.
 * @property {string} title - card title.
 * @property {string} description - card description.
 * @property {string} creatorId - card creator id.
 * @property {string[]} usersIdsWhoVoted - array of user's ids who have voted for the card.
 * @property {Tag[]} tagsIds - array of card's tags.
 * @property {CardAttachment[]} attachments - array of card's attachments.
 * @property {firestore.Timestamp} createdAt - timestamp when card was created.
 */
export interface Card {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  usersIdsWhoVoted: string[];
  tags: Tag[];
  attachments: CardAttachment[];
  createdAt: firestore.Timestamp;
}
