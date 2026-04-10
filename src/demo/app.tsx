import { SparklesIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  attachViewportGlow,
} from '../lib'
import { attachThreeViewportGlow } from '../lib/three'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'

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

const GLOWING_RENDERER_PRESET = {
  inset: -2,
  radius: 0,
  rotationDuration: 1800,
  width: 9,
} as const

const THREE_RENDERER_PRESET = {
  inset: -2,
  radius: 0,
  rotationDuration: 2200,
  width: 5,
} as const

type DemoRenderer = 'glowing' | 'three'

function getRendererPreset(renderer: DemoRenderer) {
  return renderer === 'three'
    ? THREE_RENDERER_PRESET
    : GLOWING_RENDERER_PRESET
}

export function App() {
  const initialPreset = getRendererPreset('glowing')
  const controllerRef = useRef<
    ReturnType<typeof attachViewportGlow> | ReturnType<typeof attachThreeViewportGlow> | null
  >(null)
  const flashHideTimerRef = useRef<number | null>(null)
  const [active, setActive] = useState(true)
  const [renderer, setRenderer] = useState<DemoRenderer>('glowing')
  const [width, setWidth] = useState<number>(initialPreset.width)
  const [inset, setInset] = useState<number>(initialPreset.inset)
  const [radius, setRadius] = useState<number>(initialPreset.radius)
  const [rotationDuration, setRotationDuration] = useState<number>(
    initialPreset.rotationDuration,
  )
  const [minimumVisibleMs, setMinimumVisibleMs] = useState(520)

  const applyRendererPreset = (nextRenderer: DemoRenderer) => {
    const preset = getRendererPreset(nextRenderer)
    setRenderer(nextRenderer)
    setWidth(preset.width)
    setInset(preset.inset)
    setRadius(preset.radius)
    setRotationDuration(preset.rotationDuration)
  }

  useEffect(() => {
    controllerRef.current?.destroy()

    const options = {
      active,
      colors: APPLE_COLORS,
      colors2: APPLE_COLORS_2,
      inset,
      minimumVisibleMs,
      radius: `${radius}px`,
      rotationDuration,
      width,
    }
    const controller =
      renderer === 'three'
        ? attachThreeViewportGlow(options)
        : attachViewportGlow(options)

    controllerRef.current = controller

    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [active, inset, minimumVisibleMs, radius, renderer, rotationDuration, width])

  useEffect(() => {
    return () => {
      if (flashHideTimerRef.current !== null) {
        window.clearTimeout(flashHideTimerRef.current)
      }
    }
  }, [])

  const presetSummary = useMemo(
    () =>
      [
        `inset ${inset}px`,
        `radius ${radius}px`,
        `width ${width}px`,
        `phase ${rotationDuration}ms`,
        `renderer ${renderer}`,
      ].join(' / '),
    [inset, radius, renderer, rotationDuration, width],
  )

  const flashQuickAction = () => {
    if (flashHideTimerRef.current !== null) {
      window.clearTimeout(flashHideTimerRef.current)
    }

    controllerRef.current?.show()
    setActive(true)

    flashHideTimerRef.current = window.setTimeout(() => {
      controllerRef.current?.hide()
      setActive(false)
      flashHideTimerRef.current = null
    }, Math.max(minimumVisibleMs + 260, 900))
  }

  const toggleGlow = () => {
    if (active) {
      controllerRef.current?.hide()
      setActive(false)
      return
    }

    controllerRef.current?.show()
    setActive(true)
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1180px] flex-col gap-5 rounded-[1.75rem] border border-white/70 bg-white/58 p-5 shadow-[0_18px_60px_rgba(209,201,227,0.28)] backdrop-blur-[10px] sm:p-7">
        <header className="flex flex-col gap-4 border-b border-black/6 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              <SparklesIcon className="size-3.5" />
              `.ui` viewport glow core
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
                Corner-based ambient glow for viewport UIs
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-neutral-600 sm:text-base">
                Core is vanilla TypeScript and CSS. This demo compares a
                package-wrapped glow against a quieter Three.js aurora that
                keeps color on the perimeter and only reacts with a short boost
                when it appears.
              </p>
            </div>
          </div>
          <div className="rounded-full border border-black/8 bg-white/70 px-4 py-2 text-sm text-neutral-500">
            {presetSummary}
          </div>
        </header>

        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="flex min-h-[520px] flex-col overflow-hidden">
            <div className="border-b border-black/6 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                Four-corner perimeter preview
              </h2>
            </div>
            <div className="grid flex-1 place-items-center px-6 py-8">
              <div className="grid w-full max-w-[760px] gap-5 rounded-[2rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="rounded-[1.75rem] border border-black/6 bg-white/82 px-6 py-5">
                  <p className="text-sm font-medium text-neutral-500">
                    Instant feedback
                  </p>
                  <p className="mt-2 text-lg font-semibold text-neutral-950">
                    Fast actions should get one readable boost, then settle back
                    into a quiet edge drift.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-black/6 bg-white/82 px-6 py-5">
                  <p className="text-sm font-medium text-neutral-500">
                    Ambient border behavior
                  </p>
                  <p className="mt-2 text-lg font-semibold text-neutral-950">
                    The edges should stay thin and calm while the corners hold a
                    little more color.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-5 p-5">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                Controls
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                Tune the preset
              </h2>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm text-neutral-600">
                Renderer
                <div className="flex gap-2">
                  <Button
                    onClick={() => applyRendererPreset('glowing')}
                    variant={renderer === 'glowing' ? 'default' : 'outline'}
                  >
                    glowing
                  </Button>
                  <Button
                    onClick={() => applyRendererPreset('three')}
                    variant={renderer === 'three' ? 'default' : 'outline'}
                  >
                    three
                  </Button>
                </div>
              </label>
              <label className="grid gap-2 text-sm text-neutral-600">
                Width
                <input
                  className="accent-neutral-900"
                  max={12}
                  min={4}
                  onChange={(event) => setWidth(Number(event.currentTarget.value))}
                  type="range"
                  value={width}
                />
              </label>
              <label className="grid gap-2 text-sm text-neutral-600">
                Inset
                <input
                  className="accent-neutral-900"
                  max={-2}
                  min={-8}
                  onChange={(event) => setInset(Number(event.currentTarget.value))}
                  type="range"
                  value={inset}
                />
              </label>
              <label className="grid gap-2 text-sm text-neutral-600">
                Radius
                <input
                  className="accent-neutral-900"
                  max={40}
                  min={0}
                  onChange={(event) => setRadius(Number(event.currentTarget.value))}
                  type="range"
                  value={radius}
                />
              </label>
              <label className="grid gap-2 text-sm text-neutral-600">
                Phase Cycle
                <input
                  className="accent-neutral-900"
                  max={4200}
                  min={1200}
                  onChange={(event) =>
                    setRotationDuration(Number(event.currentTarget.value))
                  }
                  step={100}
                  type="range"
                  value={rotationDuration}
                />
              </label>
              <label className="grid gap-2 text-sm text-neutral-600">
                Minimum Visible Time
                <input
                  className="accent-neutral-900"
                  max={1200}
                  min={120}
                  onChange={(event) =>
                    setMinimumVisibleMs(Number(event.currentTarget.value))
                  }
                  step={20}
                  type="range"
                  value={minimumVisibleMs}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={toggleGlow}>
                {active ? 'Hide glow' : 'Show glow'}
              </Button>
              <Button onClick={flashQuickAction} variant="outline">
                Flash quick action
              </Button>
              <Button onClick={() => setActive(true)} variant="ghost">
                Hold active
              </Button>
            </div>

            <div className="rounded-[1.5rem] border border-black/8 bg-black/[0.03] p-4 text-sm leading-6 text-neutral-600">
              Public API target:
              <code className="mt-2 block rounded-xl bg-black/[0.04] px-3 py-2 text-[13px] text-neutral-900">
                {renderer === 'glowing'
                  ? 'attachViewportGlow(options)'
                  : "import { attachThreeViewportGlow } from 'apple-intelligence-glow-ui/three'"}
              </code>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
