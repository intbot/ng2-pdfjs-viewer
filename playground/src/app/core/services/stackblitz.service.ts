import { Injectable } from '@angular/core';
import sdk from '@stackblitz/sdk';

const SAMPLE_PDF = '/assets/samples/tracemonkey.pdf';

// StackBlitz's `angular-cli` is an EngineBlock template: it resolves npm deps
// from the project's top-level `dependencies` map, NOT from a package.json file
// (that's WebContainers-only). We pass both — `dependencies` for EngineBlock
// today, the package.json file as a fallback if the template ever moves to
// WebContainers — so `import … from 'ng2-pdfjs-viewer'` always resolves.
const DEPENDENCIES: Record<string, string> = {
  '@angular/common': '^22.0.0',
  '@angular/compiler': '^22.0.0',
  '@angular/core': '^22.0.0',
  '@angular/platform-browser': '^22.0.0',
  'ng2-pdfjs-viewer': 'latest',
  rxjs: '^7.8.1',
  tslib: '^2.6.0',
  'zone.js': '~0.15.0',
};

/** Opens a runnable Angular project on StackBlitz that embeds a page's snippet. */
@Injectable({ providedIn: 'root' })
export class StackblitzService {
  open(title: string, code: string): void {
    const snippet = this.extractViewer(code);
    sdk.openProject(
      {
        title: `ng2-pdfjs-viewer — ${title}`,
        description: 'Generated from the ng2-pdfjs-viewer playground.',
        template: 'angular-cli',
        dependencies: DEPENDENCIES,
        files: this.files(snippet),
      },
      { openFile: 'src/app/app.component.ts', newWindow: true },
    );
  }

  /** Pull the <ng2-pdfjs-viewer …></ng2-pdfjs-viewer> block out of a mixed snippet. */
  private extractViewer(code: string): string {
    const m = code.match(/<ng2-pdfjs-viewer[\s\S]*?<\/ng2-pdfjs-viewer>/);
    return m ? m[0] : '<ng2-pdfjs-viewer [pdfSrc]="pdfSrc"></ng2-pdfjs-viewer>';
  }

  private files(snippet: string): Record<string, string> {
    const indented = snippet.split('\n').map((l) => '      ' + l).join('\n');
    return {
      'src/index.html': '<pg-root></pg-root>\n',
      'src/main.ts': [
        `import { bootstrapApplication } from '@angular/platform-browser';`,
        `import { AppComponent } from './app/app.component';`,
        `bootstrapApplication(AppComponent).catch((e) => console.error(e));`,
        '',
      ].join('\n'),
      'src/app/app.component.ts': [
        `import { Component } from '@angular/core';`,
        `import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';`,
        ``,
        `@Component({`,
        `  selector: 'pg-root',`,
        `  standalone: true,`,
        `  imports: [PdfJsViewerModule],`,
        `  template: \``,
        `    <div style="height: 90vh">`,
        indented,
        `    </div>\`,`,
        `})`,
        `export class AppComponent {`,
        `  // A superset of inputs so generated snippets resolve. Tweak freely.`,
        `  pdfSrc = '${SAMPLE_PDF}';`,
        `  page = 1; zoom = 'auto'; cursor = 'select'; scroll = 'vertical';`,
        `  spread = 'none'; pageMode = 'none'; rotation = 0;`,
        `  theme = 'auto'; primaryColor: string | undefined; backgroundColor: string | undefined;`,
        `  borderRadius: string | undefined; toolbarDensity = 'default';`,
        `  toolbarPosition = 'top'; sidebarPosition = 'left';`,
        `  showOpenFile = true; showDownload = true; showPrint = true; showFind = true;`,
        `  showFullScreen = true; showViewBookmark = true; showSidebar = true;`,
        `  downloadFileName = 'document.pdf'; downloadOnLoad = false; printOnLoad = false;`,
        `  showLastPageOnLoad = false; rotateCW = false; showSpinner = true;`,
        `  spinnerClass: string | undefined; errorOverride = false; errorMessage = '';`,
        `  urlValidation = true; locale = 'en-US';`,
        `  controlVisibility = { download: true, print: true, find: true };`,
        `  themeConfig = { theme: 'auto' };`,
        `}`,
        '',
      ].join('\n'),
      'angular.json': JSON.stringify(
        {
          version: 1,
          projects: {
            app: {
              projectType: 'application',
              root: '',
              sourceRoot: 'src',
              architect: {
                build: {
                  builder: '@angular-devkit/build-angular:browser',
                  options: {
                    outputPath: 'dist',
                    index: 'src/index.html',
                    main: 'src/main.ts',
                    polyfills: ['zone.js'],
                    tsConfig: 'tsconfig.json',
                    assets: [
                      { glob: '**/*', input: 'node_modules/ng2-pdfjs-viewer/pdfjs', output: '/assets/pdfjs' },
                    ],
                  },
                },
              },
            },
          },
        },
        null,
        2,
      ),
      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'ES2022',
            moduleResolution: 'bundler',
            experimentalDecorators: true,
            strict: false,
            lib: ['ES2022', 'dom'],
          },
        },
        null,
        2,
      ),
      'package.json': JSON.stringify(
        {
          name: 'ng2-pdfjs-viewer-example',
          dependencies: DEPENDENCIES,
          devDependencies: {
            '@angular-devkit/build-angular': '^22.0.0',
            '@angular/cli': '^22.0.0',
            '@angular/compiler-cli': '^22.0.0',
            typescript: '~5.9.0',
          },
        },
        null,
        2,
      ),
    };
  }
}
