import { cp, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const sourceCss = resolve(projectRoot, 'src/lib/styles/viewport-glow.css')
const outputCss = resolve(projectRoot, 'dist/lib/style.css')

await mkdir(dirname(outputCss), { recursive: true })
await cp(sourceCss, outputCss)
