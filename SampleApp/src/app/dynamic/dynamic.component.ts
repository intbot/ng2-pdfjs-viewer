import { Component, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: "app-dynamic",
  standalone: false,
  templateUrl: "./dynamic.component.html",
  styleUrls: ["./dynamic.component.scss"],
})
export class DynamicComponent implements OnInit {
  @ViewChild("viewer", { static: false }) public embeddedPdfViewer;
  isPdfLoaded = false;
  zoom = "auto";
  cursor = "hand";
  scroll = "wrapped";
  spread = "even";

  constructor() {}

  ngOnInit() {}

  pdfLoaded() {
    console.log(this.embeddedPdfViewer);
    this.isPdfLoaded = !this.isPdfLoaded;
  }
}
