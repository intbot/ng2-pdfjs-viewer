import {Component, OnInit, ViewChild} from '@angular/core';
import { ChangedScale, ChangedRotation } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-big',
  standalone: false,
  templateUrl: './big.component.html',
  styleUrls: ['./big.component.scss']
})
export class BigComponent implements OnInit {
  @ViewChild('bigPdfViewer', { static: true }) public bigPdfViewer;

  constructor() { }

  ngOnInit() {
  }

  public testBeforePrint() {
    console.log('testBeforePrint() successfully called');
    console.log(this.bigPdfViewer.page);
    this.bigPdfViewer.page = 3;
    console.log(this.bigPdfViewer.page);
  }

  public testAfterPrint() {
    console.log('testAfterPrint() successfully called');
  }

  public testPagesLoaded(count: number) {
    console.log('testPagesLoaded() successfully called. Total pages # : ' + count);
  }

  public testPageChange(pageNumber: number) {
    console.log('testPageChange() successfully called. Current page # : ' + pageNumber);
  }

  public testScaleChange(scale: ChangedScale) {
    console.log('testScaleChange() successfully called. Scale : ' , scale);
  }

  public testRotationChange(rotation: ChangedRotation) {
    console.log('testRotationChange() successfully called. Rotation : ' , rotation);
  }
}
