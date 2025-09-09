# Server-Side PDF API Examples

This document provides examples of how to create server-side APIs that return PDFs as byte arrays for use with ng2-pdfjs-viewer. These examples cover the most common server technologies used with Angular frontends.

## Table of Contents

- [ASP.NET Core (C#)](#aspnet-core-c)
- [Node.js (Express)](#nodejs-express)
- [Python (FastAPI)](#python-fastapi)
- [Java (Spring Boot)](#java-spring-boot)
- [PHP (Laravel)](#php-laravel)
- [Go (Gin)](#go-gin)

---

## ASP.NET Core (C#)

### Use Case 1: RDLC Local Report Viewer

```csharp
[HttpGet]
[Route("MyReport")]
public IActionResult GetReport()
{
    // var reportObjectList1
    // var reportObjectList2
    var reportViewer = new ReportViewer { ProcessingMode = ProcessingMode.Local };
    reportViewer.LocalReport.ReportPath = "Reports/MyReport.rdlc";

    reportViewer.LocalReport.DataSources.Add(new ReportDataSource("NameOfDataSource1", reportObjectList1));
    reportViewer.LocalReport.DataSources.Add(new ReportDataSource("NameOfDataSource2", reportObjectList2));

    Warning[] warnings;
    string[] streamids;
    string mimeType;
    string encoding;
    string extension;

    var bytes = reportViewer.LocalReport.Render("application/pdf", null, out mimeType, out encoding, out extension, out streamids, out warnings);
    return File(bytes, "application/pdf");
}
```

### Use Case 2: Return Physical PDF from Server

```csharp
[HttpGet]
[Route("GetMyPdf")]
public async Task<IActionResult> GetMyPdf()
{
    var stream = await GetStreamFromSource();
    return File(stream, "application/pdf");
}

// OR

[HttpGet]
[Route("GetMyPdf")]
public IActionResult GetMyPdf()
{
    var pdfPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/pdfjs/web/gre_research_validity_data.pdf");
    byte[] bytes = System.IO.File.ReadAllBytes(pdfPath);
    return File(bytes, "application/pdf");
}
```

### Use Case 3: Generate PDF with iTextSharp

```csharp
[HttpGet]
[Route("GeneratePdf")]
public IActionResult GeneratePdf()
{
    using (var memoryStream = new MemoryStream())
    {
        var document = new Document(PageSize.A4, 25, 25, 30, 30);
        var writer = PdfWriter.GetInstance(document, memoryStream);
        
        document.Open();
        document.Add(new Paragraph("Hello World PDF"));
        document.Close();
        
        var bytes = memoryStream.ToArray();
        return File(bytes, "application/pdf", "generated.pdf");
    }
}
```

---

## Node.js (Express)

### Use Case 1: Return Physical PDF File

```javascript
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

app.get('/api/pdf/:filename', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'pdfs', req.params.filename);
        const pdfBuffer = await fs.readFile(filePath);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.send(pdfBuffer);
    } catch (error) {
        res.status(404).send('PDF not found');
    }
});
```

### Use Case 2: Generate PDF with PDFKit

```javascript
const PDFDocument = require('pdfkit');

app.get('/api/generate-pdf', (req, res) => {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    
    doc.pipe(res);
    doc.fontSize(20).text('Hello World PDF', 100, 100);
    doc.end();
});
```

### Use Case 3: Generate PDF with Puppeteer

```javascript
const puppeteer = require('puppeteer');

app.get('/api/html-to-pdf', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent('<h1>Hello World PDF</h1>');
    const pdfBuffer = await page.pdf({ format: 'A4' });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
});
```

---

## Python (FastAPI)

### Use Case 1: Return Physical PDF File

```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import os

app = FastAPI()

@app.get("/api/pdf/{filename}")
async def get_pdf(filename: str):
    file_path = f"pdfs/{filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )
```

### Use Case 2: Generate PDF with ReportLab

```python
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from fastapi.responses import Response
import io

@app.get("/api/generate-pdf")
async def generate_pdf():
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.drawString(100, 750, "Hello World PDF")
    p.showPage()
    p.save()
    
    buffer.seek(0)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )
```

### Use Case 3: Generate PDF with WeasyPrint

```python
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

@app.get("/api/html-to-pdf")
async def html_to_pdf():
    html_content = "<h1>Hello World PDF</h1>"
    html = HTML(string=html_content)
    pdf_bytes = html.write_pdf()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )
```

---

## Java (Spring Boot)

### Use Case 1: Return Physical PDF File

```java
@RestController
@RequestMapping("/api")
public class PdfController {
    
    @GetMapping("/pdf/{filename}")
    public ResponseEntity<Resource> getPdf(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("pdfs/" + filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
```

### Use Case 2: Generate PDF with iText

```java
@GetMapping("/generate-pdf")
public ResponseEntity<byte[]> generatePdf() {
    try {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(new PdfWriter(baos));
        Document document = new Document(pdfDoc);
        
        document.add(new Paragraph("Hello World PDF"));
        document.close();
        
        byte[] pdfBytes = baos.toByteArray();
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
```

### Use Case 3: Generate PDF with JasperReports

```java
@GetMapping("/report")
public ResponseEntity<byte[]> generateReport() {
    try {
        JasperReport jasperReport = JasperCompileManager.compileReport("reports/MyReport.jrxml");
        Map<String, Object> parameters = new HashMap<>();
        
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, new JREmptyDataSource());
        byte[] pdfBytes = JasperExportManager.exportReportToPdf(jasperPrint);
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
```

---

## PHP (Laravel)

### Use Case 1: Return Physical PDF File

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PdfController extends Controller
{
    public function getPdf($filename)
    {
        $filePath = storage_path("app/pdfs/{$filename}");
        
        if (!file_exists($filePath)) {
            return response()->json(['error' => 'PDF not found'], 404);
        }
        
        return response()->file($filePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline'
        ]);
    }
}
```

### Use Case 2: Generate PDF with TCPDF

```php
use TCPDF;

public function generatePdf()
{
    $pdf = new TCPDF();
    $pdf->AddPage();
    $pdf->SetFont('helvetica', '', 12);
    $pdf->Cell(0, 10, 'Hello World PDF', 0, 1);
    
    $pdfBytes = $pdf->Output('', 'S');
    
    return response($pdfBytes, 200, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline'
    ]);
}
```

### Use Case 3: Generate PDF with DomPDF

```php
use Dompdf\Dompdf;
use Dompdf\Options;

public function htmlToPdf()
{
    $options = new Options();
    $options->set('defaultFont', 'Arial');
    
    $dompdf = new Dompdf($options);
    $dompdf->loadHtml('<h1>Hello World PDF</h1>');
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    
    $pdfBytes = $dompdf->output();
    
    return response($pdfBytes, 200, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline'
    ]);
}
```

---

## Go (Gin)

### Use Case 1: Return Physical PDF File

```go
package main

import (
    "net/http"
    "os"
    "path/filepath"
    "github.com/gin-gonic/gin"
)

func getPdf(c *gin.Context) {
    filename := c.Param("filename")
    filePath := filepath.Join("pdfs", filename)
    
    if _, err := os.Stat(filePath); os.IsNotExist(err) {
        c.JSON(http.StatusNotFound, gin.H{"error": "PDF not found"})
        return
    }
    
    c.Header("Content-Type", "application/pdf")
    c.Header("Content-Disposition", "inline")
    c.File(filePath)
}
```

### Use Case 2: Generate PDF with gofpdf

```go
import "github.com/jung-kurt/gofpdf"

func generatePdf(c *gin.Context) {
    pdf := gofpdf.New("P", "mm", "A4", "")
    pdf.AddPage()
    pdf.SetFont("Arial", "B", 16)
    pdf.Cell(40, 10, "Hello World PDF")
    
    var buf bytes.Buffer
    pdf.Output(&buf)
    
    c.Header("Content-Type", "application/pdf")
    c.Header("Content-Disposition", "inline")
    c.Data(http.StatusOK, "application/pdf", buf.Bytes())
}
```

---

## Frontend Integration

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiUrl = 'https://your-api.com/api';

  constructor(private http: HttpClient) {}

  getPdf(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/${filename}`, {
      responseType: 'blob'
    });
  }

  generatePdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/generate-pdf`, {
      responseType: 'blob'
    });
  }
}
```

### Angular Component Usage

```typescript
export class PdfViewerComponent {
  pdfSrc: string | Blob = '';

  constructor(private pdfService: PdfService) {}

  loadPdf() {
    this.pdfService.getPdf('sample.pdf').subscribe(blob => {
      this.pdfSrc = blob;
    });
  }
}
```

```html
<ng2-pdfjs-viewer [pdfSrc]="pdfSrc" [showSpinner]="true">
</ng2-pdfjs-viewer>
```

---

## Important Notes

### Content-Type Headers
Always set the correct Content-Type header:
- `Content-Type: application/pdf`
- `Content-Disposition: inline` (for viewing in browser)
- `Content-Disposition: attachment` (for downloading)

### CORS Configuration
Ensure your server allows CORS requests from your Angular application:

```csharp
// ASP.NET Core
services.AddCors(options => {
    options.AddPolicy("AllowAngular", builder => {
        builder.WithOrigins("http://localhost:4200")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});
```

### Error Handling
Always implement proper error handling for:
- File not found (404)
- Server errors (500)
- Invalid file formats
- Memory management for large files

### Security Considerations
- Validate file paths to prevent directory traversal attacks
- Implement authentication/authorization
- Sanitize user inputs
- Set appropriate file size limits
- Use HTTPS in production

---

## Related Resources

- [ng2-pdfjs-viewer Documentation](../lib/README.MD)
- [Live Demo](https://angular-pdf-viewer-demo.vercel.app/)
- [Source Code](https://github.com/intbot/ng2-pdfjs-viewer/tree/main/SampleApp)
