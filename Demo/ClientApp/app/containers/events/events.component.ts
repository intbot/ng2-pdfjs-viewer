import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html'
})
export class EventsComponent {

    public testBeforePrint() {
        console.log("testBeforePrint() successfully called");
        alert("Before print event emitted!");
    }

    public testAfterPrint() {
        console.log("testAfterPrint() successfully called");
        alert("After print event emitted!");
    }

    public testPagesLoaded(count: number) {
        console.log("testPagesLoaded() successfully called. Total pages # : " + count);
        alert(`Document is loaded!. Total pages : ${count}`);
    }

    public htmlcode =
        `
<!-- your.component.html -->
<ng2-pdfjs-viewer pdfSrc="gre_research_validity_data.pdf" viewerId="MyUniqueID" (onBeforePrint)="testBeforePrint()" (onAfterPrint)="testAfterPrint()" (onPagesLoaded)="testPagesLoaded($event)">
</ng2-pdfjs-viewer>
`;

    public tscode =
        `
<!-- your.component.ts -->
public testBeforePrint() {
    console.log("testBeforePrint() successfully called");
}

public testAfterPrint() {
    console.log("testAfterPrint() successfully called");
}

public testPagesLoaded(count: number) {
    console.log("testPagesLoaded() successfully called. Total pages # : " + count);
}
`;
}