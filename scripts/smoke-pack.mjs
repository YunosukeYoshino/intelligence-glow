import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const bunBin = process.execPath

const packageJson = JSON.parse(
  await readFile(resolve(projectRoot, 'package.json'), 'utf8'),
)
const tarballBaseName = `${packageJson.name.replace(/^@/, '').replace(/\//g, '-')}-${packageJson.version}.tgz`

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })

  if (result.status === 0) {
    return result
  }

  const output = [result.stdout, result.stderr]
    .filter(Boolean)
    .join('\n')
    .trim()
  throw new Error(output || `Command failed: ${command} ${args.join(' ')}`)
}

const scratchRoot = await mkdtemp(join(tmpdir(), `${packageJson.name}-`))
const tarballDir = join(scratchRoot, 'tarball')
const consumerDir = join(scratchRoot, 'consumer')
const consumerNodeModulesDir = join(consumerDir, 'node_modules')
const unpackDir = join(scratchRoot, 'unpacked')

process.env.TMPDIR = scratchRoot

await mkdir(tarballDir, { recursive: true })
await mkdir(consumerDir, { recursive: true })
await mkdir(consumerNodeModulesDir, { recursive: true })
await mkdir(unpackDir, { recursive: true })

run(bunBin, ['pm', 'pack', '--quiet', '--destination', tarballDir], projectRoot)

const tarballPath = join(tarballDir, tarballBaseName)
const packageDir = join(consumerNodeModulesDir, packageJson.name)

await writeFile(
  join(consumerDir, 'package.json'),
  JSON.stringify(
    {
      name: `${packageJson.name}-smoke`,
      private: true,
      type: 'module',
    },
    null,
    2,
  ),
)

run('/usr/bin/tar', ['-xzf', tarballPath, '-C', unpackDir], projectRoot)
await rename(join(unpackDir, 'package'), packageDir)
await symlink(
  resolve(projectRoot, 'node_modules/glowing'),
  join(consumerNodeModulesDir, 'glowing'),
)
await symlink(
  resolve(projectRoot, 'node_modules/three'),
  join(consumerNodeModulesDir, 'three'),
)

await writeFile(
  join(consumerDir, 'main.mjs'),
  [
    "import assert from 'node:assert/strict'",
    "import { createRequire } from 'node:module'",
    '',
    `const lib = await import('${packageJson.name}')`,
    `const threeLib = await import('${packageJson.name}/three')`,
    'const require = createRequire(import.meta.url)',
    `const stylePath = require.resolve('${packageJson.name}/style.css')`,
    '',
    "assert.equal(typeof lib.attachViewportGlow, 'function')",
    "assert.equal(typeof lib.attachGlowingViewportGlow, 'function')",
    "assert.equal('attachThreeViewportGlow' in lib, false)",
    "assert.equal(typeof threeLib.attachThreeViewportGlow, 'function')",
    "assert.ok(stylePath.endsWith('/dist/lib/style.css'))",
    '',
    "console.log('smoke-pack ok')",
  ].join('\n'),
)

const smoke = run(bunBin, ['main.mjs'], consumerDir)
process.stdout.write(smoke.stdout)
