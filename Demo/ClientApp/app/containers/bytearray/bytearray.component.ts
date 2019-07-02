import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-bytearray',
    templateUrl: './bytearray.component.html'
})
export class ByteArrayComponent {
    @ViewChild('pdfViewer') public pdfViewer;

    constructor(private http: HttpClient) {
        let url = "api/document/getmypdf";
        this.downloadFile(url).subscribe(
            (res) => {
                this.pdfViewer.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
                this.pdfViewer.refresh(); // Ask pdf viewer to load/refresh pdf
            }
        );
    }

    private downloadFile(url: string): any {
        return this.http.get(url, { responseType: 'blob' })
            .pipe(
                map((result: any) => {
                    return result;
                })
            );
    }

    public htmlcode =
`
<!-- your.component.html -->
<div style="height: 600px">
    <ng2-pdfjs-viewer #pdfViewer></ng2-pdfjs-viewer>
</div>
`;

    public tscode =
`
<!-- your.component.ts -->
 @ViewChild('pdfViewer') public pdfViewer;

constructor(private http: HttpClient) {
    let url = "api/document/getmypdf";
    this.downloadFile(url).subscribe(
        (res) => {
            this.pdfViewer.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
            this.pdfViewer.refresh(); // Ask pdf viewer to load/refresh pdf
        }
    );
}

private downloadFile(url: string): any {
    return this.http.get(url, { responseType: 'blob' })
        .pipe(
            map((result: any) => {
                return result;
            })
        );
}
`;
    public cscode = 
`
[HttpGet]
[Route("GetMyPdf")]
public IActionResult GetMyPdf()
{
    var pdfPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/pdfjs/web/gre_research_validity_data.pdf");
    byte[] bytes = System.IO.File.ReadAllBytes(pdfPath);
    return File(bytes, "application/pdf");
}`;

}
