import { Injectable } from '@angular/core';
import { CodeBinding } from '../models';

@Injectable({ providedIn: 'root' })
export class CodeGenService {
  /**
   * Build an Angular template snippet for <ng2-pdfjs-viewer> from the active
   * bindings. Bindings equal to their `omitWhen` value are dropped so the
   * snippet only shows what the user actually changed — honest, copy-pasteable.
   */
  generate(bindings: CodeBinding[], tag = 'ng2-pdfjs-viewer'): string {
    const lines: string[] = [];

    for (const b of bindings) {
      if (b.omitWhen !== undefined && b.value === b.omitWhen) continue;

      if (b.twoWay) {
        lines.push(`  [(${b.name})]="${b.name}"`);
        continue;
      }
      switch (b.kind) {
        case 'expr':
          lines.push(`  [${b.name}]="${b.value}"`);
          break;
        case 'string':
          lines.push(`  [${b.name}]="'${b.value}'"`);
          break;
        case 'number':
        case 'boolean':
          lines.push(`  [${b.name}]="${b.value}"`);
          break;
      }
    }

    if (lines.length === 0) {
      return `<${tag} [pdfSrc]="pdfSrc"></${tag}>`;
    }
    return `<${tag}\n${lines.join('\n')}>\n</${tag}>`;
  }
}
