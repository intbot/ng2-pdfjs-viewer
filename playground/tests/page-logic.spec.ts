import { describe, it, expect } from "vitest";
import { Injector, runInInjectionContext } from "@angular/core";
import { SamplePdfService } from "../src/app/core/services/sample-pdf.service";
import { CodeGenService } from "../src/app/core/services/code-gen.service";
import { EditorComponent } from "../src/app/pages/editor/editor.component";
import { SearchComponent } from "../src/app/pages/search/search.component";
import { ProtectionComponent } from "../src/app/pages/protection/protection.component";
import { PowerComponent } from "../src/app/pages/power/power.component";
import { FormsComponent } from "../src/app/pages/forms/forms.component";
import { ErrorsComponent } from "../src/app/pages/errors/errors.component";

// Pages are exercised as plain classes inside a manual injection context -
// no TestBed, no template rendering (the viewer itself is covered by the lib
// suite and the Playwright sweep).
const injector = Injector.create({
  providers: [
    { provide: SamplePdfService, useClass: SamplePdfService },
    { provide: CodeGenService, useClass: CodeGenService },
  ],
});

function make<T>(cls: new () => T): T {
  return runInInjectionContext(injector, () => new cls());
}

describe("editor page", () => {
  it("tracks editor mode and reflects opt-in editors in the snippet", () => {
    const page = make(EditorComponent);
    expect(page.mode()).toBe("none");
    expect(page.code()).not.toContain("enableSignatureEditor");

    page.signatures.set(true);
    page.comments.set(true);
    expect(page.code()).toContain(`[enableSignatureEditor]="true"`);
    expect(page.code()).toContain(`[enableCommentEditor]="true"`);
  });

  it("records editor state events", () => {
    const page = make(EditorComponent);
    page.onState({
      isEditing: true,
      isEmpty: false,
      hasSomethingToUndo: true,
      hasSomethingToRedo: false,
      hasSelectedEditor: false,
    });
    expect(page.editorState()?.hasSomethingToUndo).toBe(true);
  });
});

describe("search page", () => {
  it("generates a faithful search() snippet from the current options", () => {
    const page = make(SearchComponent);
    page.query.set("revenue");
    page.entireWord.set(true);
    const code = page.code();
    expect(code).toContain(`search("revenue"`);
    expect(code).toContain("entireWord: true");
    expect(code).toContain("searchNext()");
  });
});

describe("protection page", () => {
  it("builds the contentProtection config from the toggles", () => {
    const page = make(ProtectionComponent);
    page.blockPrint.set(true);
    page.noSelect.set(true);
    page.watermarkText.set("DRAFT");
    page.opacity.set(0.5);

    expect(page.protection()).toEqual({
      blockPrint: true,
      blockDownload: false,
      disableTextSelection: true,
      watermark: { text: "DRAFT", opacity: 0.5 },
    });
  });

  it("sends watermark: null when the watermark is off", () => {
    const page = make(ProtectionComponent);
    page.watermarkOn.set(false);
    expect(page.protection().watermark).toBeNull();
  });
});

describe("power page", () => {
  it("derives pageColors from the dark-pages toggle", () => {
    const page = make(PowerComponent);
    expect(page.pageColors()).toBeNull();
    page.darkPages.set(true);
    expect(page.pageColors()).toEqual({
      background: "#1e1e1e",
      foreground: "#e8e8e8",
    });
  });

  it("records pagesEdited events", () => {
    const page = make(PowerComponent);
    page.onPagesEdited({ operation: "delete", pagesCount: 13 });
    expect(page.lastPagesEdit()).toEqual({ operation: "delete", pagesCount: 13 });
  });
});

describe("forms page", () => {
  it("counts fields and change events from [(formData)]", () => {
    const page = make(FormsComponent);
    expect(page.fieldCount()).toBe(0);
    page.onFormDataChange({ name: "Ada", ok: true });
    page.onFormDataChange({ name: "Ada Lovelace", ok: true });
    expect(page.fieldCount()).toBe(2);
    expect(page.changes()).toBe(2);
  });

  it("pins the AcroForm sample document", () => {
    const page = make(FormsComponent);
    expect(page.src).toBe("/assets/samples/form-sample.pdf");
  });
});

describe("errors page", () => {
  it("broken-URL and password simulations are mutually exclusive", () => {
    const page = make(ErrorsComponent);
    page.toggleProtected();
    expect(page.src()).toBe("/assets/samples/password-sample.pdf");
    page.toggleBroken();
    expect(page.protectedDoc()).toBe(false);
    expect(page.src()).toBe("/assets/samples/missing-document.pdf");
    page.toggleProtected();
    expect(page.broken()).toBe(false);
  });

  it("counts onPasswordPrompt events and resets on toggle", () => {
    const page = make(ErrorsComponent);
    page.toggleProtected();
    page.onPasswordPrompt();
    page.onPasswordPrompt();
    expect(page.passwordPrompts()).toBe(2);
    page.toggleProtected();
    page.toggleProtected();
    expect(page.passwordPrompts()).toBe(0);
  });

  it("includes the event binding in the snippet only for protected docs", () => {
    const page = make(ErrorsComponent);
    expect(page.code()).not.toContain("onPasswordPrompt");
    page.toggleProtected();
    expect(page.code()).toContain(`(onPasswordPrompt)="onPasswordPrompt()"`);
  });
});
