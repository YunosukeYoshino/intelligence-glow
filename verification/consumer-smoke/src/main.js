import './styles.css'
import 'intelligence-glow/style.css'
import { attachViewportGlow } from 'intelligence-glow'

const APPLE_COLORS = [
  '#ff7db8',
  '#8f7dff',
  '#ffd067',
  '#ff9a72',
  '#8f7dff',
  '#ff7db8',
]

const APPLE_COLORS_2 = [
  'rgba(255,173,208,0.96)',
  'rgba(255,255,255,0)',
  'rgba(196,181,253,0.94)',
  'rgba(255,255,255,0)',
  'rgba(255,213,128,0.94)',
  'rgba(255,255,255,0)',
  'rgba(255,173,208,0.96)',
]

const GLOWING_DEMO_PRESET = {
  inset: -2,
  minimumVisibleMs: 520,
  radius: '0px',
  rotationDuration: 1800,
  width: 9,
}

const app = document.querySelector('#app')

if (!app) {
  throw new Error('Missing #app container')
}

app.innerHTML = `
  <main class="page-shell">
    <section class="hero-card">
      <p class="eyebrow">.ui consumer smoke</p>
      <h1>Viewport glow package import check</h1>
      <p class="copy">
        This consumer example keeps the original demo preset and only passes
        custom colors through the package arguments.
      </p>
      <div class="actions">
        <button type="button" data-toggle-viewport>Toggle viewport glow</button>
      </div>
      <div class="status-grid">
        <div class="status-pill">renderer: glowing</div>
        <div class="status-pill">width: 9px</div>
        <div class="status-pill">rotation: 1800ms</div>
        <div class="status-pill">customization: colors only</div>
      </div>
      <div class="preview-shell">
        <article class="preview-card">
          <p class="preview-label">Original demo preset</p>
          <p class="preview-copy">
            Calm perimeter glow with the same glowing defaults used by the demo.
          </p>
        </article>
        <article class="preview-card">
          <p class="preview-label">Consumer usage</p>
          <p class="preview-copy">
            Import the package, add the stylesheet, and swap only the color arrays.
          </p>
        </article>
      </div>
    </section>
  </main>
`

const viewportButton = document.querySelector('[data-toggle-viewport]')

if (!(viewportButton instanceof HTMLButtonElement)) {
  throw new Error('Missing viewport toggle button')
}

const viewportGlow = attachViewportGlow({
  active: true,
  colors: APPLE_COLORS,
  colors2: APPLE_COLORS_2,
  ...GLOWING_DEMO_PRESET,
})

let viewportActive = true

viewportButton.addEventListener('click', () => {
  viewportActive = !viewportActive
  viewportGlow.setActive(viewportActive)
  viewportButton.textContent = viewportActive
    ? 'Toggle viewport glow'
    : 'Enable viewport glow'
})

document.body.dataset.consumerSmoke = 'ready'
window.__consumerSmoke = {
  packageReady: true,
  viewportReady: true,
}

window.addEventListener('beforeunload', () => {
  viewportGlow.destroy()
})
