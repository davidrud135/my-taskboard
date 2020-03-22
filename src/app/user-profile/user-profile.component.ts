import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from './../auth/auth.service';
import { UserProfileService } from './../core/user-profile.service';
import { User } from '../core/models/user.model';
import { ProfileAvatarActionsComponent } from '../core/components/profile-avatar-actions/profile-avatar-actions.component';
import { ProfileAvatarActionsResponse } from '../core/models/profile-avatar-actions-response.model';
import { noEmptyValueValidator } from '../utils/no-empty-value.validator';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User;
  userProfileForm: FormGroup;
  isAvatarImageInProcess = false;
  snackBarDuration = 3000;
  userSub: Subscription;

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.getUser().subscribe((user: User) => {
      this.user = user;
      this.userProfileForm = new FormGroup({
        fullName: new FormControl(user.fullName, [
          Validators.required,
          noEmptyValueValidator,
        ]),
        username: new FormControl(user.username, [
          Validators.required,
          noEmptyValueValidator,
        ]),
      });
    });
  }

  openAvatarActions(): void {
    this.bottomSheet
      .open(ProfileAvatarActionsComponent)
      .afterDismissed()
      .subscribe(this.handleProfileAvatarActionsResponse);
  }

  onAvatarImageUpload(image: File) {
    this.isAvatarImageInProcess = true;
    this.userProfileService.uploadAvatarImage(image).then(() => {
      this.isAvatarImageInProcess = false;
      this.snackBar.open('✔️ Avatar updated.', '', {
        duration: this.snackBarDuration,
      });
    });
  }

  onAvatarImageRemove(): void {
    this.isAvatarImageInProcess = true;
    this.userProfileService
      .setDefaultUserAvatarImage()
      .then(() => {
        this.snackBar.open('✔️ Avatar removed.', '', {
          duration: this.snackBarDuration,
        });
      })
      .catch(() => {
        this.snackBar.open("❌ Can't remove default avatar image!", 'OK');
      })
      .finally(() => (this.isAvatarImageInProcess = false));
  }

  onSaveForm() {
    const { value } = this.userProfileForm;
    const cleanProfileData = this.clearFormDataValues(value);
    this.userProfileService.updateProfileData(cleanProfileData).then(() => {
      this.snackBar.open('✔️ Profile data updated.', '', {
        duration: this.snackBarDuration,
      });
    });
  }

  resetForm() {
    this.userProfileForm.reset(this.user);
  }

  handleProfileAvatarActionsResponse = (
    resp: ProfileAvatarActionsResponse | undefined,
  ): void => {
    if (!resp) return;
    switch (resp.type) {
      case 'upload':
        this.onAvatarImageUpload(resp.image);
        break;
      case 'remove':
        this.onAvatarImageRemove();
        break;
      case 'not-image':
        this.snackBar.open('⚠️ Avatar can be only of image type!', 'OK');
    }
  };

  clearFormDataValues(data: object): object {
    for (const key in data) {
      data[key] = data[key].trim();
    }
    return data;
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
