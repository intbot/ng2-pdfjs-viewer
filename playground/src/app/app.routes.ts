import { Routes } from '@angular/router';
import { FEATURES } from './core/feature-registry';
import { PlaygroundShellComponent } from './shell/playground-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: PlaygroundShellComponent,
    children: [
      ...FEATURES.map((f) => ({ path: f.route, loadComponent: f.load })),
      { path: '**', redirectTo: '' },
    ],
  },
];
