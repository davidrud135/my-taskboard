import { CardAttachment } from '@core/models/card-attachment.model';
import { FirestoreBoard } from '@core/models/firestore-board.model';
import { List } from '@core/models/list.model';
import { User } from '@core/models/user.model';
import { Card } from '@core/models/card.model';
import { Tag } from '@core/models/tag.model';

export function trackByIndexFn(idx: number): number {
  return idx;
}

export function boardTrackByFn(
  idx: number,
  board: FirestoreBoard & { id: string },
): string {
  return board.id;
}

export function listTrackByFn(idx: number, list: List): string {
  return list.id;
}

export function cardTrackByFn(idx: number, card: Card): string {
  return card.id;
}

export function memberTrackByFn(idx: number, member: User): string {
  return member.id;
}

export function tagTrackByFn(idx: number, tag: Tag): string {
  return tag.id;
}
