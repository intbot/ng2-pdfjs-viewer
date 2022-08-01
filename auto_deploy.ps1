copy .\pdfjs\web\viewer.js .\assets\pdfjs\web -Force
npm run build
cd dist
npm pack
copy .\hoabanmc-ng2-pdfjs-viewer-1.1.2.tgz \ -Force
cd .
npm uninstall hoabanmc-ng2-pdfjs-viewer
npm install .\hoabanmc-ng2-pdfjs-viewer-1.1.2.tgz
npm start
