import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from './../../../environments/environment';
import { AuthService } from './../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['../auth.scss'],
})
export class SignInComponent implements OnInit {
  projectTitle: string;
  signInForm: FormGroup;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.projectTitle = environment.projectTitle;
    this.route.data.subscribe((data: Data) => {
      this.titleService.setTitle(data['routeTitle']);
    });
    this.onSuccessSignIn();
    this.signInForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', Validators.required),
    });
  }

  onSignIn(): void {
    this.isLoading = true;
    const { email, pass } = this.signInForm.value;
    this.authService.signIn(email, pass).catch(this.showErrorSnackBar);
  }

  onGoogleSignIn(): void {
    this.authService.signInWithGoogle().catch(this.showErrorSnackBar);
  }

  onSuccessSignIn(): void {
    this.authService.isAuthenticated().subscribe((isAuth: boolean) => {
      if (isAuth) {
        this.isLoading = false;
        this.router.navigateByUrl('');
      }
    });
  }

  // As a callback function
  showErrorSnackBar = (errMsg: string) => {
    this.snackBar.open(errMsg, 'OK', {
      verticalPosition: 'top',
    });
    this.isLoading = false;
  }
}
