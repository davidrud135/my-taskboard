import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

const modules = [MatToolbarModule, MatMenuModule];

@NgModule({
  imports: [...modules],
  exports: [...modules],
})
export class MaterialModule {}
