// Puppeteer e2e smoke test for the SampleApp.
//
// Replaces the retired Protractor setup. Assumes the dev server is already
// running at http://localhost:4200 (start it with `npm start`). Loads the app,
// asserts it boots and renders the PDF viewer, then exits 0 (pass) or 1 (fail).
//
// Run: npm run e2e   (after `npm start` in another terminal)
const puppeteer = require("puppeteer");
const http = require("http");

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:4200";

function checkServerAvailable(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => resolve(res.statusCode === 200));
    req.on("error", () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function run() {
  console.log(`🔍 Checking SampleApp server at ${BASE_URL} ...`);
  if (!(await checkServerAvailable(BASE_URL))) {
    console.error(`❌ Server not available at ${BASE_URL}. Run "npm start" first.`);
    process.exit(1);
  }
  console.log("✅ Server is up.");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // 1) The Angular app booted.
    await page.waitForSelector("app-root", { timeout: 15000 });

    // 2) The PDF viewer component rendered its iframe (the core feature).
    await page.waitForSelector("ng2-pdfjs-viewer iframe, iframe", {
      timeout: 20000,
    });

    if (pageErrors.length) {
      console.error("❌ Console/page errors during load:");
      pageErrors.forEach((m) => console.error("   - " + m));
      process.exit(1);
    }

    console.log("✅ SampleApp smoke test passed: app booted and PDF viewer rendered.");
    process.exit(0);
  } catch (err) {
    console.error("❌ SampleApp smoke test failed:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
