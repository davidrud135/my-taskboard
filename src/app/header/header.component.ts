import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '@app/auth/auth.service';
import { environment } from '@env/environment.prod';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  projectTitle: string;
  user$: Observable<User | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.projectTitle = environment.projectTitle;
    this.user$ = this.authService.getUser();
  }

  onSignOut(): void {
    this.authService.signOut();
  }
}
