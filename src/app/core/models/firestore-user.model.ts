/**
 * Defines interface for user in Firestore.
 * @property {string} email - user's email.
 * @property {string} fullName - user's full name.
 * @property {string} nickname - user's username.
 * @property {string} avatarURL - user's avatar image URL.
 */
export interface FirestoreUser {
  email: string;
  fullName: string;
  username: string;
  avatarURL: string;
}
