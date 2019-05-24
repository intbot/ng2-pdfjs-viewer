npm run build
cd dist
npm pack
copy .\ng2-pdfjs-viewer-1.0.0.tgz ..\ng6SampleApp\ -Force
cd ..\ng6SampleApp\
npm uninstall ng2-pdfjs-viewer
npm install .\ng2-pdfjs-viewer-1.0.0.tgz
ng serve