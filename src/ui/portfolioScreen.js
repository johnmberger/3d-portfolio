import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { portfolio } from '../data/portfolio.js'

const _screenPos = new THREE.Vector3()
const _screenNormal = new THREE.Vector3()
const _toCamera = new THREE.Vector3()

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildMarkup() {
  const experience = portfolio.experience
    .map(
      (job) => `
      <button class="folio-job" type="button" data-id="${escapeHtml(job.id)}">
        <span class="folio-job__main">
          <span class="folio-job__company">${escapeHtml(job.company)}</span>
          <span class="folio-job__title">${escapeHtml(job.title)}</span>
        </span>
        <span class="folio-job__side">
          <span class="folio-job__dates">${escapeHtml(job.dates)}</span>
          <span class="folio-job__tag">${escapeHtml(job.tag)}</span>
        </span>
      </button>`,
    )
    .join('')

  const projects = portfolio.projects
    .map(
      (p) => `
      <button class="folio-project" type="button" data-id="${escapeHtml(p.id)}">
        <span class="folio-project__meta">
          <span class="folio-project__title">${escapeHtml(p.title)}</span>
          <span class="folio-project__year">${escapeHtml(p.year)}</span>
        </span>
        <span class="folio-project__tag">${escapeHtml(p.tag)}</span>
      </button>`,
    )
    .join('')

  const skills = portfolio.skills
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('')

  const links = portfolio.links
    .map(
      (l) =>
        `<a class="folio-link" href="${escapeHtml(l.href)}" target="_blank" rel="noreferrer">${escapeHtml(l.label)}</a>`,
    )
    .join('<span class="folio-link-sep">·</span>')

  return `
    <div class="folio">
      <header class="folio-top">
        <div>
          <p class="folio-brand">${escapeHtml(portfolio.name)}</p>
          <p class="folio-role">${escapeHtml(portfolio.role)} · ${escapeHtml(portfolio.location)}</p>
        </div>
        <button class="folio-close" type="button" aria-label="Close resume">✕</button>
      </header>

      <nav class="folio-tabs" aria-label="Resume sections">
        <button class="folio-tab is-active" type="button" data-tab="experience">Experience</button>
        <button class="folio-tab" type="button" data-tab="projects">Projects</button>
        <button class="folio-tab" type="button" data-tab="about">About</button>
      </nav>

      <div class="folio-body">
        <section class="folio-panel" data-view="experience">
          <div class="folio-jobs">${experience}</div>
        </section>

        <section class="folio-panel" data-view="projects" hidden>
          <div class="folio-projects">${projects}</div>
        </section>

        <section class="folio-panel" data-view="about" hidden>
          <p class="folio-blurb">${escapeHtml(portfolio.blurb)}</p>
          <p class="folio-kicker">Skills</p>
          <ul class="folio-skills">${skills}</ul>
          <p class="folio-kicker">Education</p>
          <p class="folio-edu">
            <strong>${escapeHtml(portfolio.education.degree)}</strong>
            · ${escapeHtml(portfolio.education.school)}
            <span class="folio-edu__detail">${escapeHtml(portfolio.education.detail)}</span>
          </p>
          <div class="folio-contact">
            <a class="folio-mail" href="mailto:${escapeHtml(portfolio.email)}">${escapeHtml(portfolio.email)}</a>
            <p class="folio-links">${links}</p>
          </div>
        </section>

        <section class="folio-detail" data-view="detail" hidden>
          <button class="folio-back" type="button">← Back</button>
          <p class="folio-detail__tag"></p>
          <h2 class="folio-detail__title"></h2>
          <p class="folio-detail__meta"></p>
          <p class="folio-detail__summary"></p>
          <ul class="folio-detail__highlights"></ul>
          <p class="folio-detail__stack"></p>
          <a class="folio-detail__link" href="#" target="_blank" rel="noreferrer" hidden>View project →</a>
        </section>
      </div>
    </div>
  `
}

export function createPortfolioScreen(monitor) {
  const element = document.createElement('div')
  element.className = 'portfolio-screen'
  element.innerHTML = buildMarkup()

  // 850×480 px → scale 0.001 matches the 0.85×0.48 screen plane
  element.style.width = '850px'
  element.style.height = '480px'
  element.style.backfaceVisibility = 'hidden'

  const object = new CSS3DObject(element)
  object.position.set(0, 0.42, 0.032)
  object.scale.set(0.001, 0.001, 0.001)
  // CSS3DObject defaults to pointer-events: auto, which blocks WebGL raycasts
  element.style.pointerEvents = 'none'
  monitor.add(object)

  const tabs = element.querySelectorAll('.folio-tab')
  const panels = {
    experience: element.querySelector('[data-view="experience"]'),
    projects: element.querySelector('[data-view="projects"]'),
    about: element.querySelector('[data-view="about"]'),
  }
  const detailView = element.querySelector('[data-view="detail"]')
  const detailTag = element.querySelector('.folio-detail__tag')
  const detailTitle = element.querySelector('.folio-detail__title')
  const detailMeta = element.querySelector('.folio-detail__meta')
  const detailSummary = element.querySelector('.folio-detail__summary')
  const detailHighlights = element.querySelector('.folio-detail__highlights')
  const detailStack = element.querySelector('.folio-detail__stack')
  const detailLink = element.querySelector('.folio-detail__link')

  let activeTab = 'experience'
  let detailKind = null

  function hideAllPanels() {
    for (const panel of Object.values(panels)) panel.hidden = true
    detailView.hidden = true
  }

  function setTab(tab) {
    activeTab = tab
    detailKind = null
    hideAllPanels()
    panels[tab].hidden = false
    tabs.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.tab === tab)
    })
  }

  function showList() {
    setTab(activeTab === 'about' ? 'experience' : activeTab)
  }

  function showJob(id) {
    const job = portfolio.experience.find((j) => j.id === id)
    if (!job) return
    detailKind = 'job'
    hideAllPanels()
    detailTag.textContent = job.company
    detailTitle.textContent = job.title
    detailMeta.textContent = `${job.dates} · ${job.location}`
    detailSummary.textContent = job.summary
    detailHighlights.innerHTML = (job.highlights || [])
      .map((h) => `<li>${escapeHtml(h)}</li>`)
      .join('')
    detailHighlights.hidden = !job.highlights?.length
    detailStack.textContent = job.stack?.length ? job.stack.join(' · ') : ''
    detailStack.hidden = !job.stack?.length
    detailLink.hidden = true
    detailView.hidden = false
  }

  function showProject(id) {
    const project = portfolio.projects.find((p) => p.id === id)
    if (!project) return
    detailKind = 'project'
    hideAllPanels()
    detailTag.textContent = project.tag
    detailTitle.textContent = project.title
    detailMeta.textContent = project.year
    detailSummary.textContent = project.summary
    detailHighlights.innerHTML = ''
    detailHighlights.hidden = true
    detailStack.hidden = true
    if (project.href && project.href !== '#') {
      detailLink.href = project.href
      detailLink.hidden = false
    } else {
      detailLink.hidden = true
    }
    detailView.hidden = false
  }

  tabs.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      setTab(btn.dataset.tab)
    })
  })

  element.querySelectorAll('.folio-job').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      showJob(btn.dataset.id)
    })
  })

  element.querySelectorAll('.folio-project').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      showProject(btn.dataset.id)
    })
  })

  element.querySelector('.folio-back').addEventListener('click', (e) => {
    e.stopPropagation()
    setTab(detailKind === 'project' ? 'projects' : 'experience')
  })

  const closeBtn = element.querySelector('.folio-close')

  return { element, object, closeBtn, showList }
}

/** CSS3D ignores WebGL depth — hide the UI when the camera is behind the screen. */
export function updatePortfolioVisibility({ object }, camera, screenMesh) {
  screenMesh.getWorldPosition(_screenPos)
  _screenNormal.set(0, 0, 1).transformDirection(screenMesh.matrixWorld)
  _toCamera.subVectors(camera.position, _screenPos)
  object.visible = _toCamera.dot(_screenNormal) > 0.02
}

export function createCSS3DRenderer(container) {
  const cssRenderer = new CSS3DRenderer()
  cssRenderer.setSize(window.innerWidth, window.innerHeight)
  cssRenderer.domElement.className = 'css3d-layer'
  cssRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(cssRenderer.domElement)
  return cssRenderer
}
