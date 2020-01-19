import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from './../../../environments/environment';
import { AuthService } from './../auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['../auth.scss'],
})
export class SignUpComponent implements OnInit {
  projectTitle: string;
  signUpForm: FormGroup;
  passwordMinLength = 6;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.projectTitle = environment.projectTitle;
    this.route.data.subscribe((data: Data) => {
      this.titleService.setTitle(data['routeTitle']);
    });
    this.redirectOnSuccessfulRegistration();
    this.signUpForm = new FormGroup({
      fullName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [
        Validators.required,
        Validators.minLength(this.passwordMinLength),
      ]),
    });
  }

  onSignUp(): void {
    this.isLoading = true;
    const { fullName, email, pass } = this.signUpForm.value;
    this.authService
      .signUp(fullName, email, pass)
      .catch(this.showErrorSnackBar);
  }

  onGoogleSignIn(): void {
    this.authService.signInWithGoogle().catch(this.showErrorSnackBar);
  }

  redirectOnSuccessfulRegistration(): void {
    this.authService.isAuthenticated().subscribe((isAuth: boolean) => {
      if (isAuth) {
        this.isLoading = false;
        this.snackBar.dismiss();
        this.router.navigateByUrl('');
      }
    });
  }

  // tslint:disable: semicolon
  showErrorSnackBar = (errMsg: string): void => {
    this.snackBar.open(errMsg, 'OK', {
      verticalPosition: 'top',
    });
    this.isLoading = false;
  };
}
