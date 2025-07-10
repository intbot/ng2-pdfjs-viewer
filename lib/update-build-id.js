const fs = require('fs');
const path = require('path');

// Get current timestamp in Eastern Time (NYC)
const now = new Date();
const easternTimeString = now.toLocaleString("en-US", {
  timeZone: "America/New_York",
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

// Convert to Eastern Time timestamp format: YYYY-MM-DDTHH-MM-SS-000Z
const timestamp = easternTimeString
  .replace(/(\d+)\/(\d+)\/(\d+),\s*(\d+):(\d+):(\d+)/, '$3-$1-$2T$4-$5-$6-000Z')
  .replace(/[:.]/g, '-');

console.log(`🔄 Updating BUILD_ID to: ${timestamp}`);

// Files to update
const files = [
  'src/ng2-pdfjs-viewer.component.ts',
  'pdfjs/web/postmessage-wrapper.js'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace any existing timestamp in BUILD_ID logs with new timestamp
    const originalContent = content;
    
    // Pattern to match: '🟢 ...: TEST LOG - BUILD_ID:', 'any-timestamp-here'
    const buildIdPattern = /('🟢 [^']+: TEST LOG - BUILD_ID:',\s*')([^']*)(')/g;
    content = content.replace(buildIdPattern, `$1${timestamp}$3`);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('🎉 BUILD_ID update complete!'); 