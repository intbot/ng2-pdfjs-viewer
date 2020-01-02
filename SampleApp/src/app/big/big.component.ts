import {Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-big',
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
}
