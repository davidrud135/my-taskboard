/**
 * Defines interface for Tag document data in Firestore.
 * @property {string} name - name of the tag.
 * @property {string} color - fill color of the tag.
 */
export interface FirestoreTag {
  name: string;
  color: string;
}
