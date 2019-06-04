copy .\pdfjs\web\viewer.js .\ng6SampleApp\src\assets\pdfjs\web -Force
npm run build
cd dist
npm pack
copy .\ng2-pdfjs-viewer-3.2.8.tgz ..\ng6SampleApp\ -Force
cd ..\ng6SampleApp\
npm uninstall ng2-pdfjs-viewer
npm install .\ng2-pdfjs-viewer-3.2.8.tgz
ng serve