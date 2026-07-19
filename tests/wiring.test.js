import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('entry wiring', () => {
  it('injects Vercel Analytics from main', () => {
    const main = readFileSync(resolve(root, 'src/main.js'), 'utf8')
    expect(main).toContain("from '@vercel/analytics'")
    expect(main).toMatch(/\binject\s*\(/)
  })

  it('wires the interactive hotspots in main', () => {
    const main = readFileSync(resolve(root, 'src/main.js'), 'utf8')
    expect(main).toContain('FOCUS_BY_KIND')
    expect(main).toContain('focusTvNews')
    expect(main).toContain('beginFocus')
    expect(main).toContain('createMobileResumeSheet')
    for (const kind of [
      'monitor',
      'turntable',
      'bathroom',
      'credits',
      'about',
      'photo',
      'dog',
      'tv',
      'lightSwitch',
    ]) {
      expect(main).toMatch(new RegExp(`\\b${kind}\\b`))
    }
  })

  it('uses www canonical and OG URLs in index.html', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    expect(html).toContain('https://www.johnberger.dev/')
    expect(html).toContain('https://www.johnberger.dev/og.png')
    expect(html).toContain('John\'s Studio')
  })
})
