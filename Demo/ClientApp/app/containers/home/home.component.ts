import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  // Use "constructor"s only for dependency injection
  constructor(public translate: TranslateService) {}

  // Here you want to handle anything with @Input()'s @Output()'s
  // Data retrieval / etc - this is when the Component is "ready" and wired up
  ngOnInit() {}

  public setLanguage(lang) {
    this.translate.use(lang);
  }

    public htmlcode = 
`<!-- your.component.html -->
<ng2-pdfjs-viewer pdfSrc="pdf-sample.pdf"></ng2-pdfjs-viewer>`;
}
