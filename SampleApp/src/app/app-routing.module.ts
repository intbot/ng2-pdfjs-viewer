import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InlineComponent} from './inline/inline.component';
import {BigComponent} from './big/big.component';
import {DynamicComponent} from './dynamic/dynamic.component';
import {FeaturesComponent} from './features/features.component';

const routes: Routes = [
  {path: '', component: FeaturesComponent},
  {path: 'inline', component: InlineComponent},
  {path: 'dynamic', component:DynamicComponent},
  {path: 'big', component: BigComponent},
  {path: 'features', component: FeaturesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
