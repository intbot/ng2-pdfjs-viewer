import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ng2-pdfjs-viewer',
  tagline: 'The most comprehensive Angular PDF viewer powered by Mozilla PDF.js',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here (the deployed docs host).
  // Used for canonical, og:url, og:image and the sitemap.
  url: 'https://angularpdf.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'intbot', // Usually your GitHub org/user name.
  projectName: 'ng2-pdfjs-viewer', // Usually your repo name.

  onBrokenLinks: 'throw',
  // Docusaurus 3.10+: markdown link handling moved under markdown.hooks.
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // Vercel Analytics will be added via React component in src/pages/index.tsx
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/intbot/ng2-pdfjs-viewer/tree/master/docs-website/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
        // GA4 via gtag (the v3 way; the old `googleAnalytics` UA option is gone).
        // Only wired when a real measurement ID is present, so a build without
        // the env var doesn't inject a broken gtag tag.
        ...(process.env.GA_MEASUREMENT_ID
          ? { gtag: { trackingID: process.env.GA_MEASUREMENT_ID } }
          : {}),
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Respect the visitor's OS theme; fall back to the dark brand canvas.
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
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
        {to: '/showcase', label: 'Showcase', position: 'left'},
        {to: '/docs/migration/overview', label: 'Migration', position: 'left'},
        {to: '/docs/api/component-inputs', label: 'API', position: 'left'},
        {
          href: 'https://demo.angularpdf.com/',
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
            {
              label: 'Submit your project',
              to: '/showcase/submit',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Press Kit',
              to: '/press',
            },
            {
              label: 'Live Demo',
              href: 'https://demo.angularpdf.com/',
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
      { name: 'keywords', content: 'angular pdf viewer, angular-pdf-viewer, pdf-viewer, pdf-reader, PDF, pdfjs, pdf.js, ng2-pdfjs-viewer, angular-component, angular-pdf, angular 2 - 22, angular 22, angular-library, typescript, javascript, pdf-rendering, pdf-annotations, pdf-forms, pdf-signature, pdf-search, pdf-zoom, pdf-printing, text-to-speech, mobile-first, accessibility, open-source'},
      {name: 'description', content: 'The most comprehensive Angular PDF viewer, powered by Mozilla PDF.js 6 — view, annotate, sign, fill forms, search, and read aloud from one component. Supports Angular 10 through 22.'},
      {property: 'og:description', content: 'The most comprehensive Angular PDF viewer, powered by Mozilla PDF.js 6. Annotations, forms, signatures, search, and read-aloud from one Angular component.'},
      // og:image / twitter:image are emitted from themeConfig.image above.
      // twitter:card must be a card TYPE, not an image path.
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'algolia-site-verification', content: '2EB837F87D9AEC8E' },
    ],
    algolia: {
      // Algolia search configuration via environment variables
      appId: process.env.ALGOLIA_APP_ID || 'placeholder',
      apiKey: process.env.ALGOLIA_SEARCH_API_KEY || 'placeholder',
      indexName: process.env.ALGOLIA_INDEX_NAME || 'placeholder',
      contextualSearch: true,
      searchPagePath: 'search',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
