import { FirestoreTag } from './firestore-tag.model';

/**
 * Defines interface for Tag.
 * @extends {FirestoreTag}.
 * @property {string} id - tag's unique id.
 */
export interface Tag extends FirestoreTag {
  id: string;
}
