import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })],
}).catch((err) => console.error(err));
