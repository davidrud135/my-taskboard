import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { AuthService } from '@app/auth/auth.service';
import { UserProfileService } from '@core/user-profile.service';
import { User } from '@core/models/user.model';
import { noEmptyValueValidator } from '@app/utils/no-empty-value.validator';
import { ProfileAvatarActionsResponse } from '@core/models/profile-avatar-actions-response.model';
import { ProfileAvatarActionsComponent } from '@components/profile-avatar-actions/profile-avatar-actions.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  user$: Observable<User>;
  userProfileForm: FormGroup;
  isAvatarImageInProcess = false;
  snackBarDuration = 3000;

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private route: ActivatedRoute,
    private titleService: Title,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userProfileForm = new FormGroup({
      fullName: new FormControl(null, [
        Validators.required,
        noEmptyValueValidator,
      ]),
      username: new FormControl(null, [
        Validators.required,
        noEmptyValueValidator,
      ]),
    });
    this.route.data.subscribe((data: Data) => {
      this.titleService.setTitle(data['routeTitle']);
    });
    this.user$ = this.authService.getUser().pipe(
      filter((user: User | null) => !!user),
      tap((user: User) => {
        this.userProfileForm.get('fullName').setValue(user.fullName);
        this.userProfileForm.get('username').setValue(user.username);
      }),
    );
  }

  openAvatarActions(): void {
    this.bottomSheet
      .open(ProfileAvatarActionsComponent)
      .afterDismissed()
      .subscribe(this.handleProfileAvatarActionsResponse);
  }

  onAvatarImageUpload(image: File): void {
    this.isAvatarImageInProcess = true;
    this.userProfileService.uploadAvatarImage(image).then(() => {
      this.isAvatarImageInProcess = false;
      this.snackBar.open('Avatar successfully updated.', null, {
        duration: this.snackBarDuration,
        panelClass: 'snackbar-success',
      });
    });
  }

  onAvatarImageRemove(): void {
    this.isAvatarImageInProcess = true;
    this.userProfileService
      .setDefaultUserAvatarImage()
      .then(() => {
        this.snackBar.open('Avatar successfully removed.', null, {
          duration: this.snackBarDuration,
          panelClass: 'snackbar-success',
        });
      })
      .catch(() => {
        this.snackBar.open("Can't remove the default avatar image!", 'OK', {
          panelClass: 'snackbar-error',
        });
      })
      .finally(() => (this.isAvatarImageInProcess = false));
  }

  onSaveForm(): void {
    const { value } = this.userProfileForm;
    const cleanProfileData = this.clearFormDataValues(value);
    this.userProfileService.updateProfileData(cleanProfileData).then(() => {
      this.userProfileForm.markAsPristine();
      this.snackBar.open('Profile data successfully updated.', null, {
        duration: this.snackBarDuration,
        panelClass: 'snackbar-success',
      });
    });
  }

  resetForm(originalUserData: User): void {
    this.userProfileForm.reset(originalUserData);
  }

  clearFormDataValues(data: object): object {
    for (const key in data) {
      data[key] = data[key].trim();
    }
    return data;
  }

  // tslint:disable: semicolon
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
        this.snackBar.open('Avatar can be only of image type!', 'OK', {
          panelClass: 'snackbar-warning',
        });
    }
  };
}
