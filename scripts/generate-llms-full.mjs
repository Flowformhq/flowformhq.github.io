import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

const sourceFiles = [
  'docs/guide/ai-agents.md',
  'docs/guide/endpoints/index.md',
  'docs/guide/endpoints/html.md',
  'docs/guide/endpoints/javascript.md',
  'docs/guide/endpoints/nextjs.md',
  'docs/guide/endpoints/astro.md',
  'docs/guide/endpoints/nuxt.md',
  'docs/guide/endpoints/sveltekit.md',
  'docs/guide/endpoints/static-site-generators.md',
  'docs/guide/endpoints/mobile-and-servers.md',
]

const sections = sourceFiles.map((relPath) => {
  const content = readFileSync(resolve(root, relPath), 'utf8').trim()
  return `<!-- source: ${relPath} -->\n\n${content}`
})

const output = `# FlowForm - Complete Endpoint & AI Agent Documentation\n\n${sections.join('\n\n---\n\n')}\n`

writeFileSync(resolve(root, 'docs/public/llms-full.txt'), output, 'utf8')
console.log(`Generated docs/public/llms-full.txt (${sourceFiles.length} pages)`)
