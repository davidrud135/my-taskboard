import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

const modules = [
  MatToolbarModule,
  MatMenuModule,
  MatCardModule,
  MatDialogModule,
  MatSidenavModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
];

@NgModule({
  imports: [...modules],
  exports: [...modules],
})
export class MaterialModule {}
