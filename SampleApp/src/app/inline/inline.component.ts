import {AfterViewInit, Component, ViewChild} from '@angular/core';

@Component({
  selector: 'app-inline',
  templateUrl: './inline.component.html',
  styleUrls: ['./inline.component.scss']
})
export class InlineComponent implements AfterViewInit {
  @ViewChild('inlinePdfViewer', { static: true }) public inlinePdfViewer;
  isPdfLoaded = false;

  constructor() { }

  ngAfterViewInit() {}

}
