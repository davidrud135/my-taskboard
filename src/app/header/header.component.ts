import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { environment } from './../../environments/environment.prod';
import { User } from '../core/models/user.model';

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

  applyUserAvatar(user: User): string {
    return `url(${user.avatarURL})`;
  }

  onSignOut(): void {
    this.authService.signOut();
  }
}
