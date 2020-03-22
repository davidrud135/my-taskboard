import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

import { User } from './models/user.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  usersAvatarPhotosDirName = 'users_avatar_photos';
  currUser: User;
  defaultAvatarImageURL: string;

  constructor(
    private authService: AuthService,
    private afStore: AngularFirestore,
    private afStorage: AngularFireStorage,
  ) {
    this.authService
      .getUser()
      .subscribe((user: User) => (this.currUser = user));
    this.afStorage
      .ref(`${this.usersAvatarPhotosDirName}/default-avatar.png`)
      .getDownloadURL()
      .subscribe((url: string) => (this.defaultAvatarImageURL = url));
  }

  public uploadAvatarImage(image: File): AngularFireUploadTask {
    this.removeCurrUserAvatarImage();
    const { id } = this.currUser;
    const cleanImageName = this.getClearImageName(image.name);
    const path = `${this.usersAvatarPhotosDirName}/${id}_${cleanImageName}`;
    const imageRef = this.afStorage.storage.ref(path);
    const task = this.afStorage.upload(path, image);
    task
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          const uploadedImageURL = await imageRef.getDownloadURL();
          this.updateProfileData({ avatarURL: uploadedImageURL });
        }),
      )
      .subscribe();
    return task;
  }

  public async removeCurrUserAvatarImage(): Promise<any> {
    const { avatarURL } = this.currUser;
    if (this.defaultAvatarImageURL === avatarURL) {
      return Promise.reject();
    }
    return this.afStorage.storage.refFromURL(avatarURL).delete();
  }

  public async setDefaultUserAvatarImage(): Promise<any> {
    return Promise.all([
      this.removeCurrUserAvatarImage(),
      this.updateProfileData({ avatarURL: this.defaultAvatarImageURL }),
    ]);
  }

  public updateProfileData(data: Partial<User>): Promise<void> {
    return this.afStore.doc<User>(`users/${this.currUser.id}`).update(data);
  }

  private getClearImageName(originalImageName: string): string {
    return originalImageName
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/\W/g, '');
  }
}
