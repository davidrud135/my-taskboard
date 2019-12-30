import { FirestoreCard } from './firestore-card.model';

/**
 * Defines model for Card data.
 * @extends {FirestoreCard}.
 * @property {string} id - card's unique id.
 */
export interface Card extends FirestoreCard {
  id: string;
}
