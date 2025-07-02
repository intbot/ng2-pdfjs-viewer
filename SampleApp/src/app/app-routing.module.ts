import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InlineComponent} from './inline/inline.component';
import {BigComponent} from './big/big.component';
import {DynamicComponent} from './dynamic/dynamic.component';
import {TestFeaturesComponent} from './test-features/test-features.component';

const routes: Routes = [
  {path: '', component: BigComponent},
  {path: 'inline', component: InlineComponent},
  {path: 'dynamic', component:DynamicComponent},
  {path: 'test-features', component: TestFeaturesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
