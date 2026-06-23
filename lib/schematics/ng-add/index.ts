import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

/**
 * `ng add ng2-pdfjs-viewer` entry point.
 *
 * The CLI installs the package before this runs; the schematic records the
 * dependency (without clobbering the version the CLI chose) and points the user
 * at the one manual step that trips people up: serving the bundled PDF.js assets
 * from angular.json. We intentionally do NOT edit angular.json here — asset
 * paths vary by workspace layout and Angular version, and a wrong edit is worse
 * than a clear instruction.
 */
export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: 'ng2-pdfjs-viewer',
      version: '^26.0.0',
      overwrite: false,
    });

    context.addTask(new NodePackageInstallTask());

    context.logger.info(
      [
        '',
        'ng2-pdfjs-viewer installed.',
        'One more step — serve the bundled PDF.js assets. Add this to the "assets"',
        'array of your build target in angular.json:',
        '',
        '  { "glob": "**/*", "input": "node_modules/ng2-pdfjs-viewer/pdfjs", "output": "/assets/pdfjs" }',
        '',
        'Full setup: https://angularpdf.com/docs/getting-started',
        '',
      ].join('\n'),
    );

    return tree;
  };
}
