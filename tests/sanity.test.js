import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RESUME_URL } from '../src/resumeUrl.js'
import { portfolio } from '../src/data/portfolio.js'
import { CREDITS_ENTRIES } from '../src/objects/credits.js'
import { EARWORMS_URL } from '../src/ui/earwormsScreen.js'
import { POOPYHOOCH_URL } from '../src/ui/poopyhoochScreen.js'

const root = resolve(import.meta.dirname, '..')

function publicFile(path) {
  return resolve(root, 'public', path)
}

describe('site URLs', () => {
  it('points résumé at the hosted resume', () => {
    expect(RESUME_URL).toBe('https://resume.johnberger.dev/')
  })

  it('exposes Earworms and Poop the Hooch URLs', () => {
    expect(EARWORMS_URL).toMatch(/^https:\/\/earworms\.johnberger\.dev\/?$/)
    expect(POOPYHOOCH_URL).toBe('https://www.poopthehooch.com')
  })
})

describe('portfolio data', () => {
  it('has the core identity fields', () => {
    expect(portfolio.name).toBe('John Berger')
    expect(portfolio.email).toContain('@')
    expect(portfolio.links.length).toBeGreaterThan(0)
    expect(portfolio.experience.length).toBeGreaterThan(0)
  })

  it('includes a résumé link that matches RESUME_URL', () => {
    const resume = portfolio.links.find((l) => /r[eé]sum[eé]/i.test(l.label))
    expect(resume?.href).toBe(RESUME_URL)
  })
})

describe('credits plaque', () => {
  it('lists models with titles and https attribution links', () => {
    expect(CREDITS_ENTRIES.length).toBeGreaterThan(0)
    for (const entry of CREDITS_ENTRIES) {
      expect(entry.title).toBeTruthy()
      expect(entry.href).toMatch(/^https:\/\//)
    }
  })
})

describe('public assets', () => {
  it.each([
    'favicon.svg',
    'og.png',
    'images/johnberger.jpg',
    'models/bike/bicycle.glb',
    'models/bass/bass.glb',
    'models/food/burger.glb',
    'models/food/fries.glb',
    'models/food/soda.glb',
    'models/shiba/scene.gltf',
    'models/shiba/scene.bin',
    'models/shiba/textures/default_baseColor.png',
  ])('includes %s', (path) => {
    expect(existsSync(publicFile(path))).toBe(true)
  })
})
