import { Injectable } from '@angular/core';

/** Encodes/decodes a small config record to/from a URL-safe string (the `s` query param). */
@Injectable({ providedIn: 'root' })
export class ShareStateService {
  encode(state: Record<string, unknown>): string {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
    catch { return ''; }
  }

  decode(s: string | null): Record<string, unknown> | null {
    if (!s) return null;
    try { return JSON.parse(decodeURIComponent(escape(atob(s)))); }
    catch { return null; }
  }
}
