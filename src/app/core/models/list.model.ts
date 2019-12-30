import { FirestoreList } from './firestore-list.model';
import { Card } from './card.model';

/**
 * Defines model for List data.
 * @extends {FirestoreList}.
 * @property {string} id - List's unique id.
 * @property {Card[]} cards - List's array of cards.
 */
export interface List extends FirestoreList {
  id: string;
  cards: Card[];
}
