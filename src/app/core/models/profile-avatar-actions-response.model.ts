export interface ProfileAvatarActionsResponse {
  type: 'upload' | 'remove' | 'not-image';
  image?: File;
}
