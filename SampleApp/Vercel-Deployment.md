# SampleApp Vercel Deployment Guide

## Overview

This guide documents how to deploy the ng2-pdfjs-viewer SampleApp to Vercel using the npm version of the library while maintaining local development with yalc.

**Live Demo**: [https://angular-pdf-viewer-demo.vercel.app/](https://angular-pdf-viewer-demo.vercel.app/)

## Architecture

- **Local Development**: Uses yalc for testing library changes
- **Vercel Production**: Uses npm version of the library
- **Automatic Deployments**: Deploys on every push to main branch

## Vercel Configuration

### Project Settings
- **Root Directory**: `SampleApp`
- **Framework Preset**: Angular
- **Build Command**: `npm install ng2-pdfjs-viewer@latest --force && npm run build`
- **Output Directory**: `dist/ng6SampleApp`
- **Install Command**: `npm install`

## How It Works

- **Local Development**: Uses yalc version (`test.bat`)
- **Vercel Production**: Uses npm version (automatic deployment)
- **Build Process**: Installs latest npm version, overrides yalc, builds Angular app

## Key Points

- `--force` flag resolves peer dependency conflicts between Angular 20.x and library's relaxed dependencies
- Output directory `dist/ng6SampleApp` matches Angular build configuration
- No environment variables needed
- Automatic deployments on git push to main branch

## Troubleshooting

**Build fails with peer dependency conflicts:**
- Use `--force` flag in build command (current solution)

**"No such file or directory" error:**
- Ensure root directory is set to `SampleApp`

**Wrong output directory:**
- Use `dist/ng6SampleApp` (matches angular.json configuration)
