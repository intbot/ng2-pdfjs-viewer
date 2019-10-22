import {Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent implements OnInit {
  @ViewChild('viewer', { static: false }) public embeddedPdfViewer;
  isPdfLoaded = false;
  zoom = 'auto';

  constructor() { }

  ngOnInit() {}

  pdfLoaded() {
    console.log(this.embeddedPdfViewer);
    this.isPdfLoaded = !this.isPdfLoaded;
  }
}
