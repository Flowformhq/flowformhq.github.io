import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'FlowForm',
  description: 'Headless, API-first form and workflow engine',

  head: [
    ['meta', { name: 'theme-color', content: '#0b0f19' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700;800&family=Google+Sans+Text:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap' }],
  ],

  sitemap: {
    hostname: 'https://docs.flowformhq.com',
  },

  themeConfig: {
    logo: {
      light: '/brand/flowform-logo-light.svg',
      dark: '/brand/flowform-logo-dark.svg',
      alt: 'FlowForm'
    },
    siteTitle: false,
    nav: [
      { text: 'Guide', link: '/guide/quickstart' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'SDK', link: '/sdk/typescript' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Quickstart', link: '/guide/quickstart' },
            { text: 'Core Concepts', link: '/guide/concepts' },
            { text: 'Architecture Overview', link: '/guide/architecture' },
          ],
        },
        {
          text: 'Building Forms',
          items: [
            { text: 'Admin Panel', link: '/guide/admin-panel' },
            { text: 'Conditional Logic', link: '/guide/conditional-logic' },
          ],
        },
        {
          text: 'Security & Reliability',
          items: [
            { text: 'Field-Level Encryption', link: '/guide/security-encryption' },
            { text: 'Webhooks & HMAC Verification', link: '/guide/webhooks' },
          ],
        },
        {
          text: 'Integration',
          items: [
            { text: 'Starter Kits Overview', link: '/guide/starter-kits' },
            { text: 'React Starter Kit', link: '/guide/react-starter-kit' },
            { text: 'Vue Starter Kit', link: '/guide/vue-starter-kit' },
            { text: 'Livewire Starter Kit', link: '/guide/livewire-starter-kit' },
            { text: 'Integration Cookbook', link: '/guide/integration-cookbook' },
          ],
        },
        {
          text: 'Self-Hosting',
          items: [
            { text: 'Deployment Guide', link: '/guide/deployment' },
            { text: 'Upgrade Guide', link: '/guide/upgrade-guide' },
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

    editLink: {
      pattern: 'https://github.com/flowformhq/flowformhq.github.io/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Licensed under CC BY 4.0.',
      copyright: 'Copyright 2026 FlowFormHQ',
    },

    search: {
      provider: 'local',
    },
  },
})
