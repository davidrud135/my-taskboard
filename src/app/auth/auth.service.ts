import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  Action,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { auth } from 'firebase/app';
import { Observable, of, AsyncSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { User } from '../core/models/user.model';
import { FirestoreUser } from './../core/models/firestore-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$: Observable<User | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private afStore: AngularFirestore,
    private afStorage: AngularFireStorage,
    private router: Router,
  ) {
    this.user$ = this.afAuth.user.pipe(
      switchMap((user: firebase.User | null) => {
        if (!user) {
          return of(null);
        }
        return this.getUserDocData(user.uid);
      }),
    );
  }

  public getUser(): Observable<User | null> {
    return this.user$;
  }

  public isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map((user: User | null) => !!user));
  }

  public signUp(
    fullName: string,
    userEmail: string,
    pass: string,
  ): Promise<auth.UserCredential | string> {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(userEmail, pass)
      .then(async (resp: auth.UserCredential) => {
        await this.createEmailUser(resp.user, fullName);
        return resp;
      })
      .catch(this.handleAuthError);
  }

  public signIn(
    email: string,
    pass: string,
  ): Promise<auth.UserCredential | string> {
    return this.afAuth.auth
      .signInWithEmailAndPassword(email, pass)
      .catch(this.handleAuthError);
  }

  public signInWithGoogle(): Promise<string | auth.UserCredential> {
    return this.afAuth.auth
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then(async (resp: auth.UserCredential) => {
        if (resp.additionalUserInfo.isNewUser) {
          await this.createGoogleUser(resp.user);
        }
        return resp;
      })
      .catch(this.handleAuthError);
  }

  public async signOut(): Promise<void> {
    await this.afAuth.auth.signOut();
    this.router.navigateByUrl('/sign-in');
  }

  private getUserDocData(userId: string): Observable<User> {
    return this.afStore
      .collection('users')
      .doc(userId)
      .snapshotChanges()
      .pipe(
        map((docAction: Action<DocumentSnapshot<FirestoreUser>>) => {
          const data = docAction.payload.data();
          const id = docAction.payload.id;
          return { id, ...data };
        }),
      );
  }

  private handleAuthError(error: auth.Error): Promise<string> {
    let errorMessage = 'An unknown error occurred!';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'User with given email already exists.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Given email is not valid.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Wrong email or password.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Bad connection. Please try again.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Popup was blocked by your browser.';
        break;
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return Promise.resolve('');
      default:
        console.error(error);
    }
    return Promise.reject(errorMessage);
  }

  private async createEmailUser(
    user: firebase.User,
    fullName: string,
  ): Promise<void> {
    const { uid, email } = user;
    const username = this.getUsernameFromEmail(email);
    const defaultAvatarURL = await this.afStorage.storage
      .ref('users_avatar_photos/default-avatar.png')
      .getDownloadURL();
    return await this.setNewUserData({
      email,
      fullName,
      username,
      id: uid,
      avatarURL: defaultAvatarURL,
    });
  }

  private async createGoogleUser(user: firebase.User): Promise<void> {
    const { uid, email, displayName, photoURL } = user;
    const username = this.getUsernameFromEmail(email);
    return await this.setNewUserData({
      email,
      username,
      id: uid,
      avatarURL: photoURL,
      fullName: displayName,
    });
  }

  private async setNewUserData(userData: User): Promise<void> {
    const { id, ...firestoreUserData } = userData;
    const userDoc: AngularFirestoreDocument<FirestoreUser> = this.afStore
      .collection('users')
      .doc(id);

    return userDoc.set(firestoreUserData);
  }

  private getUsernameFromEmail(email: string): string {
    const emailName = email.substring(0, email.lastIndexOf('@'));
    return emailName.replace(/[^0-9a-z]/g, '');
  }
}
