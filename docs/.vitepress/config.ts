import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'FlowForm',
  description: 'Headless, API-first form and workflow engine',

  head: [
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'SDK', link: '/sdk/typescript' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/concepts' },
            { text: 'Admin Panel', link: '/guide/admin-panel' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Forms', link: '/api/forms' },
            { text: 'Submissions', link: '/api/submissions' },
          ],
        },
      ],
      '/sdk/': [
        {
          text: 'SDK',
          items: [
            { text: 'TypeScript', link: '/sdk/typescript' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/flowformhq/flowform' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright FlowForm Contributors',
    },

    search: {
      provider: 'local',
    },
  },
})
