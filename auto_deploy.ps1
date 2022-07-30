copy .\pdfjs\web\viewer.js .\assets\pdfjs\web -Force
npm run build
cd dist
npm pack
copy .\ng2-pdfjs-viewer-13.2.2.tgz \ -Force
cd .
npm uninstall ng2-pdfjs-viewer
npm install .\ng2-pdfjs-viewer-13.2.2.tgz
npm start
