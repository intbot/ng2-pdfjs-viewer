import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-language',
    templateUrl: './language.component.html'
})
export class LanguageComponent {
    public htmlcode =
`
<!-- your.component.html -->
<ng2-pdfjs-viewer pdfSrc="gre_research_validity_data.pdf" locale="de-AT"></ng2-pdfjs-viewer>
`;
}
