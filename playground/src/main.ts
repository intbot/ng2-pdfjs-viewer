import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// PDF.js persists per-document view state (page/zoom) in localStorage and
// restores it on load, which overrides the demos' pinned inputs and auto
// actions for returning visitors. Start every playground session pristine.
try { localStorage.removeItem('pdfjs.history'); } catch { /* storage blocked */ }

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
