import { FirestoreUser } from './firestore-user.model';

/**
 * Defines interface for user.
 * @extends {FirestoreUser}.
 * @property {string} id - user's unique id.
 */
export interface User extends FirestoreUser {
  id: string;
}
