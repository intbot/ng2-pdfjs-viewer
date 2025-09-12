import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ng2-pdfjs-viewer',
  tagline: 'The most comprehensive Angular PDF viewer powered by Mozilla PDF.js',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ng2-pdfjs-viewer.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'intbot', // Usually your GitHub org/user name.
  projectName: 'ng2-pdfjs-viewer', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/intbot/ng2-pdfjs-viewer/tree/main/docs-website/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/ng2-pdfjs-viewer-social-card.png',
    navbar: {
      title: 'ng2-pdfjs-viewer',
      logo: {
        alt: 'ng2-pdfjs-viewer Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/docs/examples/basic-usage', label: 'Examples', position: 'left'},
        {to: '/docs/migration/overview', label: 'Migration', position: 'left'},
        {to: '/docs/api/component-inputs', label: 'API', position: 'left'},
        {
          href: 'https://angular-pdf-viewer-demo.vercel.app/',
          label: 'Live Demo',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/ng2-pdfjs-viewer',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/intbot/ng2-pdfjs-viewer',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'Features',
              to: '/docs/features/overview',
            },
            {
              label: 'Examples',
              to: '/docs/examples/basic-usage',
            },
            {
              label: 'API Reference',
              to: '/docs/api/component-inputs',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/intbot/ng2-pdfjs-viewer/issues',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/intbot/ng2-pdfjs-viewer/discussions',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/ng2-pdfjs-viewer',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Live Demo',
              href: 'https://angular-pdf-viewer-demo.vercel.app/',
            },
            {
              label: 'npm Package',
              href: 'https://www.npmjs.com/package/ng2-pdfjs-viewer',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/intbot/ng2-pdfjs-viewer',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ng2-pdfjs-viewer. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'javascript', 'bash', 'json'],
    },
    metadata: [
      { name: 'keywords', content: 'angular, angular-pdf-viewer, pdf-viewer, pdf-reader, PDF, PDF Viewer, pdfjs, pdf.js, viewer, viewerjs, ng2, angular-component, angular-pdf, ng2-pdf, angular 2 - 20, angular 20, angular-library, typescript, javascript,  pdf-rendering, pdf-annotations, pdf-zoom, pdf-printing, responsive-ui, custom PDF Viewer, accessibility, open-source, component, library'},
      {name: 'description', content: 'The most comprehensive Angular PDF viewer powered by Mozilla PDF.js. 7M+ downloads, mobile-first, production-ready.'},
      { property: 'og:image', content: 'img/ng2-pdfjs-viewer-social-card.png'},
      {property: 'og:description', content: 'The most comprehensive Angular PDF viewer powered by Mozilla PDF.js'},
      { name: 'twitter:card', content: 'img/ng2-pdfjs-viewer-social-card.png'},
      { name: 'algolia-site-verification', content: '2EB837F87D9AEC8E' },
    ],
    algolia: {
      // Algolia search configuration via vercel environment variables
      appId: process.env.ALGOLIA_APP_ID || '',
      apiKey: process.env.ALGOLIA_SEARCH_API_KEY || '',
      indexName: process.env.ALGOLIA_INDEX_NAME || '',
      contextualSearch: true,
      searchPagePath: 'search',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
