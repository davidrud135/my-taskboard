// tslint:disable: max-line-length
import { firestore } from 'firebase/app';

/**
 * Defines interface for card's attachment.
 * @property {string} url - URL of the attachment.
 * @property {string} name - name of the attachment.
 * @property {number} size - size of the attachment in bytes.
 * @property {string} type - type of the attachment.
 * @property {string} extension - extension of the attachment.
 * @property {firestore.Timestamp} attachedAt - timestamp when file was attached.
 */
export interface CardAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  attachedAt: firestore.Timestamp;
}
