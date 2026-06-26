// Secondary entry point: ng2-pdfjs-viewer/signals
//
// Read-only Angular signals projected from the viewer's @Output() events, for
// zoneless and OnPush apps that prefer reading state from signals over wiring up
// a handful of (event)="..." bindings and EventEmitter subscriptions.
//
// It reads the same outputs the component already emits - it adds no new viewer
// behaviour and sends nothing anywhere. Each signal holds the latest value from
// its source output and starts as `undefined` until that output first fires
// (`loaded`/`totalPages` are derived from page initialization).
//
// Requires Angular 16+ (signals + `@angular/core/rxjs-interop`). The base package
// keeps its `>=10` peer range; only this entry point needs 16+, so import it from
// the subpath and apps on older Angular never load it:
//
//   import { pdfViewerSignals } from "ng2-pdfjs-viewer/signals";
//
// A @ViewChild viewer is only populated in ngAfterViewInit, which is NOT an
// injection context, so pass an Injector captured earlier:
//
//   @ViewChild('viewer') viewer!: PdfJsViewerComponent;
//   private injector = inject(Injector);
//   signals!: PdfViewerSignals;
//
//   ngAfterViewInit() {
//     this.signals = pdfViewerSignals(this.viewer, { injector: this.injector });
//   }
//   // template: {{ signals.page() }} / {{ signals.totalPages() }} / {{ signals.loaded() }}
//
// Called from a constructor or field initializer (where an injection context
// exists), the `injector` option can be omitted. Subscriptions are torn down with
// the injector's DestroyRef - i.e. when the host component is destroyed.

import { computed, EventEmitter, Injector, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import type {
  AnnotationEditorMode,
  AnnotationEditorState,
  ChangedRotation,
  DocumentError,
  DocumentMetadata,
  DocumentOutline,
  FindMatchesCount,
  FormDataMap,
  PagesInfo,
  PresentationMode,
  ReadAloudState,
  SidebarViewChange,
} from "ng2-pdfjs-viewer";

// The viewer outputs this entry reads, typed structurally so it doesn't depend on
// the component class. PdfJsViewerComponent satisfies this shape. (ChangedPage and
// ChangedScale are both `number`.)
export interface PdfViewerSignalSource {
  onPageChange: EventEmitter<number>;
  onScaleChange: EventEmitter<number>;
  onRotationChange: EventEmitter<ChangedRotation>;
  onPagesInit: EventEmitter<PagesInfo>;
  onDocumentError: EventEmitter<DocumentError>;
  onUpdateFindMatchesCount: EventEmitter<FindMatchesCount>;
  onReadAloudStateChange: EventEmitter<ReadAloudState>;
  onAnnotationEditorStateChange: EventEmitter<AnnotationEditorState>;
  annotationEditorChange: EventEmitter<AnnotationEditorMode>;
  onSidebarViewChanged: EventEmitter<SidebarViewChange>;
  onMetadataLoaded: EventEmitter<DocumentMetadata>;
  onOutlineLoaded: EventEmitter<DocumentOutline>;
  formDataChange: EventEmitter<FormDataMap>;
  onPresentationModeChanged: EventEmitter<PresentationMode>;
  zoomChange: EventEmitter<string>;
  cursorChange: EventEmitter<string>;
  scrollChange: EventEmitter<string>;
  spreadChange: EventEmitter<string>;
  pageModeChange: EventEmitter<string>;
}

// The read-only signal surface returned by pdfViewerSignals().
export interface PdfViewerSignals {
  /** Current 1-based page number; undefined until the first page change. */
  page: Signal<number | undefined>;
  /** Current zoom scale factor (1 = 100%); undefined until the first scale change. */
  scale: Signal<number | undefined>;
  /** Total page count, available once the document's pages initialize. */
  totalPages: Signal<number | undefined>;
  /** True once the document's pages have initialized. */
  loaded: Signal<boolean>;
  /** Last document-load error, or undefined if none. */
  error: Signal<DocumentError | undefined>;
  /** Page rotation state ({ rotation, page }). */
  rotation: Signal<ChangedRotation | undefined>;
  /** Live find/search match counts ({ current, total }). */
  findMatches: Signal<FindMatchesCount | undefined>;
  /** Read-aloud progress ({ status, page, sentence? }). */
  readAloud: Signal<ReadAloudState | undefined>;
  /** Annotation editor undo/empty/selection state. */
  annotationEditor: Signal<AnnotationEditorState | undefined>;
  /** Active annotation editor tool (highlight / ink / freetext / ...). */
  annotationEditorMode: Signal<AnnotationEditorMode | undefined>;
  /** Current sidebar panel ({ view }). */
  sidebar: Signal<SidebarViewChange | undefined>;
  /** Document metadata (title / author / ...). */
  metadata: Signal<DocumentMetadata | undefined>;
  /** Document outline / bookmarks ({ items?, hasOutline }). */
  outline: Signal<DocumentOutline | undefined>;
  /** Current AcroForm field values. */
  formData: Signal<FormDataMap | undefined>;
  /** Presentation (fullscreen) mode ({ active }). */
  presentationMode: Signal<PresentationMode | undefined>;
  /** Zoom mode string (e.g. 'auto', 'page-fit', '125'). */
  zoom: Signal<string | undefined>;
  /** Cursor tool ('select' | 'hand'). */
  cursor: Signal<string | undefined>;
  /** Scroll mode ('vertical' | 'horizontal' | 'wrapped' | 'page'). */
  scroll: Signal<string | undefined>;
  /** Spread mode ('none' | 'odd' | 'even'). */
  spread: Signal<string | undefined>;
  /** Page (view) mode. */
  pageMode: Signal<string | undefined>;
}

/**
 * Project the viewer's outputs into read-only signals. See the file header for
 * usage and the injection-context rules. The returned signals are live: each
 * updates when its source output next fires.
 */
export function pdfViewerSignals(
  viewer: PdfViewerSignalSource,
  options: { injector?: Injector } = {},
): PdfViewerSignals {
  const { injector } = options;
  const latest = <T>(source: EventEmitter<T>): Signal<T | undefined> =>
    toSignal(source, { initialValue: undefined, injector });

  const pages = latest(viewer.onPagesInit);
  return {
    page: latest(viewer.onPageChange),
    scale: latest(viewer.onScaleChange),
    totalPages: computed(() => pages()?.pagesCount),
    loaded: computed(() => pages() !== undefined),
    error: latest(viewer.onDocumentError),
    rotation: latest(viewer.onRotationChange),
    findMatches: latest(viewer.onUpdateFindMatchesCount),
    readAloud: latest(viewer.onReadAloudStateChange),
    annotationEditor: latest(viewer.onAnnotationEditorStateChange),
    annotationEditorMode: latest(viewer.annotationEditorChange),
    sidebar: latest(viewer.onSidebarViewChanged),
    metadata: latest(viewer.onMetadataLoaded),
    outline: latest(viewer.onOutlineLoaded),
    formData: latest(viewer.formDataChange),
    presentationMode: latest(viewer.onPresentationModeChanged),
    zoom: latest(viewer.zoomChange),
    cursor: latest(viewer.cursorChange),
    scroll: latest(viewer.scrollChange),
    spread: latest(viewer.spreadChange),
    pageMode: latest(viewer.pageModeChange),
  };
}
