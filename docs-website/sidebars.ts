import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'getting-started',
    'installation',
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/overview',
        'features/theming',
        'features/security',
        'features/iframe-security',
        'features/external-window',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/basic-usage',
      ],
    },
    {
      type: 'category',
      label: 'Migration Guide',
      items: [
        'migration/overview',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/component-inputs',
        'api/component-outputs',
        'api/component-methods',
      ],
    },
    'changelog',
  ],
};

export default sidebars;
