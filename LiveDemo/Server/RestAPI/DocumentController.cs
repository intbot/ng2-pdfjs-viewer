using System.IO;
using Microsoft.AspNetCore.Mvc;

namespace AspCoreServer.Controllers
{
    [Route ("api/[controller]")]
    public class DocumentController : Controller
    {
        [HttpGet]
        [Route("GetMyPdf")]
        public IActionResult GetMyPdf()
        {
            var pdfPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/pdfjs/web/gre_research_validity_data.pdf");
            byte[] bytes = System.IO.File.ReadAllBytes(pdfPath);
            return File(bytes, "application/pdf");
        }
    }

    //[HttpGet]
    //[Route("MyReport")]
    //public IActionResult GetReport()
    //{
    //// var reportObjectList1
    //// var reportObjectList2
    //var reportViewer = new ReportViewer { ProcessingMode = ProcessingMode.Local };
    //reportViewer.LocalReport.ReportPath = "Reports/MyReport.rdlc";

    //reportViewer.LocalReport.DataSources.Add(new ReportDataSource("NameOfDataSource1", reportObjectList1));
    //reportViewer.LocalReport.DataSources.Add(new ReportDataSource("NameOfDataSource2", reportObjectList1));

    //Warning[] warnings;
    //string[] streamids;
    //string mimeType;
    //string encoding;
    //string extension;

    //var bytes = reportViewer.LocalReport.Render("application/pdf", null, out mimeType, out encoding, out extension, out streamids, out warnings);

    //    // The below content-disposition is lost when we create Blob() object in client browser. Hence commented out
    //    //var cd = new System.Net.Mime.ContentDisposition
    //    //{
    //    //    FileName = "somepdf.pdf",
    //    //    Inline = true
    //    //};
    //    //Response.Headers.Add("Content-Disposition", cd.ToString());

    //    return File(bytes, "application/pdf")
    //}
}
