const puppeteer = require('puppeteer');

async function captureLogs() {
  console.log('🚀 Starting browser with console log capture...');
  console.log('📱 This will open a browser window and capture all console logs.');
  console.log('🔍 Perfect for testing ng2-pdfjs-viewer features!\n');
  
  try {
    const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set a larger viewport for better testing
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Capture all console messages with timestamps
    page.on('console', msg => {
      const timestamp = new Date().toLocaleTimeString();
      const type = msg.type().toUpperCase();
      const text = msg.text();
      
      // Color coding for different log types
      const colors = {
        'LOG': '\x1b[36m',    // Cyan
        'ERROR': '\x1b[31m',  // Red
        'WARN': '\x1b[33m',   // Yellow
        'INFO': '\x1b[32m',   // Green
        'DEBUG': '\x1b[35m'   // Magenta
      };
      
      const color = colors[type] || '\x1b[0m';
      const reset = '\x1b[0m';
      
      // Special highlighting for ng2-pdfjs-viewer logs
      if (text.includes('🔍 Ng2PdfJsViewer:')) {
        console.log(`${color}[${timestamp}] [PDF Viewer]${reset} ${text}`);
      } else {
        console.log(`${color}[${timestamp}] [Browser ${type}]${reset} ${text}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\x1b[31m[${timestamp}] [Browser ERROR] ${error.message}\x1b[0m`);
    });
    
    // Capture network errors
    page.on('error', error => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\x1b[31m[${timestamp}] [Browser CRASH] ${error.message}\x1b[0m`);
    });
    
    // Capture request failures
    page.on('requestfailed', request => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\x1b[33m[${timestamp}] [Network] Request failed: ${request.url()}\x1b[0m`);
    });
    
    console.log('📱 Navigating to SampleApp...');
    await page.goto('http://localhost:4200', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ SampleApp loaded successfully!');
    console.log('🔍 Browser console logs will appear below:');
    console.log('📋 You can now test the PDF viewer features:');
    console.log('   • Cursor modes (Hand, Select, Zoom)');
    console.log('   • Scroll modes (Vertical, Horizontal, Wrapped, Page)');
    console.log('   • Spread modes (None, Odd, Even)');
    console.log('   • Zoom levels');
    console.log('   • Locale changes');
    console.log('   • Auto actions (download, print, rotate)');
    console.log('📋 Press Ctrl+C to stop logging and close browser.\n');
    
    // Keep the browser open for manual testing
    // The process will stay alive until you press Ctrl+C
    
    // Optional: Add some helpful keyboard shortcuts
    console.log('💡 Tips:');
    console.log('   • Use F12 to open DevTools for additional debugging');
    console.log('   • Check the Network tab for any failed requests');
    console.log('   • Use the Elements tab to inspect PDF viewer elements');
    console.log('   • All ng2-pdfjs-viewer logs will be highlighted in cyan\n');
    
  } catch (error) {
    console.error('❌ Error starting log capture:', error.message);
    console.log('💡 Make sure SampleApp is running on http://localhost:4200');
    console.log('💡 Run "npm start" in the SampleApp directory first');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping log capture...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping log capture...');
  process.exit(0);
});

captureLogs().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 