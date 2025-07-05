# Console Log Capture for SampleApp

This setup allows you to capture all browser console logs directly in your terminal while testing the ng2-pdfjs-viewer features.

## 🚀 Quick Start

### Option 1: Integrated with test.bat (Recommended)
```bash
# Run the main test script with log capture
./test.bat

# When prompted, press Enter (or Y) to enable log capture
# Or press 'n' to run without log capture
```

### Option 2: Manual
```bash
# Terminal 1: Start Angular dev server
npm start

# Terminal 2: Start log capture
npm run start:with-logs
```

## 📋 What You'll See

The log capture will show:
- **All browser console logs** with timestamps
- **Color-coded messages** (cyan for PDF viewer logs)
- **Network errors** and request failures
- **Page errors** and crashes

### Example Output:
```
🚀 Starting browser with console log capture...
📱 Navigating to SampleApp...
✅ SampleApp loaded successfully!

[14:30:15] [PDF Viewer] 🔍 Ng2PdfJsViewer: PostMessage wrapper script loaded
[14:30:16] [PDF Viewer] 🔍 Ng2PdfJsViewer: PDFViewerApplication ready
[14:30:17] [PDF Viewer] 🔍 Ng2PdfJsViewer: Attempting to update cursor to: HAND
[14:30:17] [PDF Viewer] 🔍 Ng2PdfJsViewer: Cursor updated via direct access to: HAND
[14:30:20] [PDF Viewer] 🔍 Ng2PdfJsViewer: Attempting to update zoom to: 150
[14:30:20] [PDF Viewer] 🔍 Ng2PdfJsViewer: Zoom updated via event bus to: 150
```

## 🔍 Testing Features

With log capture running, you can test:

### Mode Controls
- **Cursor Modes**: Hand, Select, Zoom
- **Scroll Modes**: Vertical, Horizontal, Wrapped, Page
- **Spread Modes**: None, Odd, Even

### Zoom & Navigation
- **Zoom Levels**: Auto, Page-width, Page-height, Custom percentages
- **Page Navigation**: Jump to specific pages, last page
- **Named Destinations**: Go to bookmarks/sections

### Localization
- **Locale Changes**: Different languages
- **CSS Zoom**: Mobile-friendly zoom

### Auto Actions
- **Auto Download**: Automatic file download
- **Auto Print**: Automatic print dialog
- **Auto Rotate**: Automatic page rotation

## 🛠️ Troubleshooting

### If log capture fails to start:
1. Make sure SampleApp is running on `http://localhost:4200`
2. Check that Puppeteer is installed: `npm list puppeteer`
3. Try running manually: `node log-capture.js`

### If no logs appear:
1. Check that the browser window opened
2. Verify SampleApp loaded successfully
3. Try refreshing the page in the browser
4. Check for any error messages in the terminal

### If browser doesn't open:
1. Make sure Chrome/Chromium is installed
2. Try running with different browser: `puppeteer.launch({ executablePath: 'path/to/chrome' })`

## 📁 Files

- `log-capture.js` - Main log capture script
- `test.bat` - **Main test script with integrated log capture**
- `package.json` - Contains npm scripts for log capture

## 🎯 Perfect for Testing

This setup is ideal for testing the ng2-pdfjs-viewer fixes we implemented:
- ✅ Cursor mode functionality
- ✅ Scroll mode with PAGE option
- ✅ Zoom functionality
- ✅ Locale changes
- ✅ All PostMessage wrapper features

## 💡 Tips

1. **Use the integrated test.bat** - It's the easiest way to test with logs
2. **Keep the terminal open** while testing - all logs appear there
3. **Use F12** in the browser for additional DevTools debugging
4. **Check the Network tab** for any failed requests
5. **Press Ctrl+C** to stop log capture and close browser
6. **ng2-pdfjs-viewer logs** are highlighted in cyan for easy identification

## 🔄 Workflow

### Recommended Testing Workflow:
1. **Run `./test.bat`** - This builds the library and starts SampleApp
2. **Press Enter** when prompted for log capture
3. **Test features** - All console logs will appear in the terminal
4. **Press Ctrl+C** when done testing
5. **Repeat** for any code changes

This workflow ensures you're always testing with the latest library build and can see exactly what's happening with the PDF viewer features! 