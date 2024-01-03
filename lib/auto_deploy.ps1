copy .\pdfjs\web\viewer.js ..\SampleApp\src\assets\pdfjs\web -Force
npm run build
cd dist
npm pack
copy .\ng2-pdfjs-viewer-17.0.3.tgz ..\..\SampleApp\ -Force
cd ..\..\SampleApp\
npm uninstall ng2-pdfjs-viewer
npm install .\ng2-pdfjs-viewer-17.0.3.tgz
npm start
