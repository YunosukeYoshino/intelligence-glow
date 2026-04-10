import * as THREE from 'three'
import type { ThreeViewportGlowOptions } from '../shared/types'
import { removeViewportArtifacts, toRadiusPx } from '../shared/dom'
import { THREE_FRAGMENT_SHADER, THREE_VERTEX_SHADER } from './shaders'

const THREE_WRAPPER_SELECTOR = '.apple-three-viewport-glow'
const THREE_BOOST_DURATION_SECONDS = 0.84

export const THREE_DEFAULT_OPTIONS: Partial<Required<ThreeViewportGlowOptions>> = {
  rotationDuration: 2600,
  width: 5,
}

type ThreeUniforms = {
  uColorSpeed: { value: number }
  uGradientOffset: { value: number }
  uHueOffset: { value: number }
  uIntensity: { value: number }
  uPalette1: { value: THREE.Color }
  uPalette2: { value: THREE.Color }
  uPalette3: { value: THREE.Color }
  uPalette4: { value: THREE.Color }
  uRadius: { value: number }
  uResolution: { value: THREE.Vector2 }
  uTime: { value: number }
  uWidth: { value: number }
}

export type ThreeResources = {
  boostStartedAt: number
  camera: THREE.OrthographicCamera
  frame: number | null
  geometry: THREE.PlaneGeometry
  handleResize: () => void
  material: THREE.ShaderMaterial
  mesh: THREE.Mesh
  renderer: THREE.WebGLRenderer | null
  scene: THREE.Scene
  startedAt: number
  uniforms: ThreeUniforms
  wrapper: HTMLDivElement
}

function removeThreeArtifacts() {
  removeViewportArtifacts(THREE_WRAPPER_SELECTOR)
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function applyWrapperStyles(
  wrapper: HTMLDivElement,
  options: Required<ThreeViewportGlowOptions>,
) {
  wrapper.style.inset = `${options.inset}px`
  wrapper.style.zIndex = `${options.zIndex}`
  wrapper.style.borderRadius = `${options.radius}`
}

function toColorSpeed(rotationDuration: number) {
  return clamp(2400 / Math.max(rotationDuration, 1400) * 0.4, 0.22, 0.56)
}

function toThreeIntensity(width: number) {
  return clamp(0.76 + Math.max(width - 5, 0) * 0.015, 0.78, 0.9)
}

function applyUniforms(
  resources: ThreeResources,
  options: Required<ThreeViewportGlowOptions>,
) {
  resources.uniforms.uRadius.value = Math.max(toRadiusPx(options.radius), 0)
  resources.uniforms.uWidth.value = clamp(options.width, 4, 14)
  resources.uniforms.uColorSpeed.value = toColorSpeed(options.rotationDuration)
  resources.uniforms.uIntensity.value = toThreeIntensity(options.width)
  resources.uniforms.uPalette1.value = new THREE.Color(
    options.colors[1] ?? options.colors[0],
  )
  resources.uniforms.uPalette2.value = new THREE.Color(
    options.colors[0] ?? options.colors[1] ?? '#ff7db8',
  )
  resources.uniforms.uPalette3.value = new THREE.Color(
    options.colors[2] ?? options.colors[3] ?? '#ffd067',
  )
  resources.uniforms.uPalette4.value = new THREE.Color(
    options.colors[3] ?? options.colors[2] ?? '#ff9a72',
  )
}

function layoutResources(
  resources: ThreeResources,
  options: Required<ThreeViewportGlowOptions>,
) {
  const width = Math.max(window.innerWidth - options.inset * 2, 1)
  const height = Math.max(window.innerHeight - options.inset * 2, 1)

  resources.renderer?.setSize(width, height, false)

  const drawingWidth = resources.renderer?.domElement.width ?? width
  const drawingHeight = resources.renderer?.domElement.height ?? height

  resources.uniforms.uResolution.value.set(drawingWidth, drawingHeight)
}

function renderFrame(
  resources: ThreeResources,
  options: Required<ThreeViewportGlowOptions>,
) {
  const now = performance.now()
  const elapsedSeconds = (now - resources.startedAt) / 1000
  const boostElapsed = (now - resources.boostStartedAt) / 1000
  let gradientOffset = 0.1

  if (boostElapsed < 0.8) {
    const progress = boostElapsed / 0.8
    gradientOffset = 0.1 * (1.0 - Math.pow(progress, 0.72))
  } else if (boostElapsed < 2.0) {
    gradientOffset = 0.0
  } else if (boostElapsed < 3.2) {
    const progress = (boostElapsed - 2.0) / 1.2
    gradientOffset = 0.1 * Math.pow(progress, 1.35)
  }

  resources.uniforms.uTime.value = elapsedSeconds
  resources.uniforms.uGradientOffset.value = gradientOffset
  resources.wrapper.dataset.boostState =
    boostElapsed < THREE_BOOST_DURATION_SECONDS ? 'active' : 'idle'

  applyUniforms(resources, options)
  resources.renderer?.render(resources.scene, resources.camera)
}

export function refreshThreeResources(
  resources: ThreeResources,
  options: Required<ThreeViewportGlowOptions>,
) {
  applyWrapperStyles(resources.wrapper, options)
  layoutResources(resources, options)
  applyUniforms(resources, options)
  renderFrame(resources, options)
}

export function triggerThreeBoost(resources: ThreeResources) {
  resources.boostStartedAt = performance.now()
  resources.wrapper.dataset.boostState = 'active'
  resources.wrapper.dataset.boostToken = String(
    Number(resources.wrapper.dataset.boostToken ?? '0') + 1,
  )
}

export function createThreeResources(
  options: Required<ThreeViewportGlowOptions>,
): ThreeResources {
  removeThreeArtifacts()

  const wrapper = document.createElement('div')
  wrapper.className = 'apple-three-viewport-glow'
  wrapper.dataset.boostState = 'idle'
  wrapper.dataset.boostToken = '0'
  wrapper.setAttribute('aria-hidden', 'true')
  document.body.append(wrapper)

  let renderer: THREE.WebGLRenderer | null = null
  let canvas: HTMLCanvasElement

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    canvas = renderer.domElement
  } catch {
    canvas = document.createElement('canvas')
  }

  canvas.classList.add('apple-three-viewport-glow__canvas')
  wrapper.append(canvas)

  const uniforms: ThreeUniforms = {
    uColorSpeed: { value: toColorSpeed(options.rotationDuration) },
    uGradientOffset: { value: 0.1 },
    uHueOffset: { value: 0.82 },
    uIntensity: { value: toThreeIntensity(options.width) },
    uPalette1: { value: new THREE.Color('#8f7dff') },
    uPalette2: { value: new THREE.Color('#ff7db8') },
    uPalette3: { value: new THREE.Color('#ffd067') },
    uPalette4: { value: new THREE.Color('#ff9a72') },
    uRadius: { value: Math.max(toRadiusPx(options.radius), 0) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uWidth: { value: clamp(options.width, 4, 14) },
  }

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    depthWrite: false,
    fragmentShader: THREE_FRAGMENT_SHADER,
    transparent: true,
    uniforms,
    vertexShader: THREE_VERTEX_SHADER,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const resources: ThreeResources = {
    boostStartedAt: performance.now(),
    camera,
    frame: null,
    geometry,
    handleResize: () => {
      refreshThreeResources(resources, options)
    },
    material,
    mesh,
    renderer,
    scene,
    startedAt: performance.now(),
    uniforms,
    wrapper,
  }

  refreshThreeResources(resources, options)
  return resources
}

export function disposeThreeResources(resources: ThreeResources | null) {
  if (!resources) {
    removeThreeArtifacts()
    return
  }

  if (resources.frame !== null) {
    cancelAnimationFrame(resources.frame)
  }

  window.removeEventListener('resize', resources.handleResize)
  resources.geometry.dispose()
  resources.material.dispose()
  resources.renderer?.dispose()
  resources.wrapper.remove()
  removeThreeArtifacts()
}

export function startThreeLoop(
  resources: ThreeResources,
  getOptions: () => Required<ThreeViewportGlowOptions>,
) {
  const nextFrame = () => {
    renderFrame(resources, getOptions())
    resources.frame = requestAnimationFrame(nextFrame)
  }

  resources.frame = requestAnimationFrame(nextFrame)
}
