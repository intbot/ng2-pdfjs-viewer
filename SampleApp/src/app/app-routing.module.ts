import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InlineComponent} from './inline/inline.component';
import {BigComponent} from './big/big.component';
import {DynamicComponent} from './dynamic/dynamic.component';

const routes: Routes = [
  {path: '', component: BigComponent},
  {path: 'inline', component: InlineComponent},
  {path: 'dynamic', component:DynamicComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
