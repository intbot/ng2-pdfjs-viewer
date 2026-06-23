# Schematics — `ng add ng2-pdfjs-viewer`

Source for the `ng-add` schematic. The source is committed; the **build/publish wiring is
deferred** to a clean (non-Windows) checkout to avoid regenerating `lib/package-lock.json` on
Windows (doing so drops cross-platform optional binaries and breaks Linux `npm ci` at release).

## Wiring checklist (do on a clean/Linux checkout, then verify the build)

1. Add devDeps in `lib/package.json` (lets the schematic compile and resolve its imports):
   - `@angular-devkit/schematics`
   - `@schematics/angular`
   Run `npm install` on Linux so `package-lock.json` regenerates with the full cross-platform graph.
2. Add the published entry point to `lib/package.json`:
   ```json
   "schematics": "./schematics/collection.json"
   ```
3. Add a compile + copy step and fold it into `build`:
   ```json
   "build-schematics": "tsc -p schematics/tsconfig.json && shx cp schematics/collection.json dist/schematics/collection.json && shx cp schematics/ng-add/schema.json dist/schematics/ng-add/schema.json",
   "build": "... && npm run build-schematics"
   ```
4. Confirm `dist/schematics/collection.json`, `dist/schematics/ng-add/index.js`, and
   `dist/schematics/ng-add/schema.json` exist after `npm run build`.
5. Smoke test: `ng add ng2-pdfjs-viewer` against a scratch Angular app; verify the dependency is
   added and the assets reminder prints.

Keep the `version` in `ng-add/index.ts` roughly in step with the current major (it is a safety net;
the CLI installs the real version before the schematic runs, and `overwrite: false` preserves it).
