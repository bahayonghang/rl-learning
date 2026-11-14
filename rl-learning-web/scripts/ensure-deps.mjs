import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error('RL Atlas 需要 Node.js 22.12 或更新版本；当前为 ' + process.versions.node + '。');
  process.exit(1);
}

const manifestText = readFileSync('package.json', 'utf8');
const lockText = readFileSync('package-lock.json', 'utf8');
const manifest = JSON.parse(manifestText);
const fingerprint = createHash('sha256')
  .update(manifestText).update('\0').update(lockText).update('\0')
  .update([process.platform, process.arch, major].join(':')).digest('hex');
const marker = resolve('node_modules/.rl-atlas-dependencies.json');
const expectedPackages = [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})];
const installed = expectedPackages.every(name => existsSync(resolve('node_modules', name, 'package.json')));
let previous;
try { previous = JSON.parse(readFileSync(marker, 'utf8')); } catch { /* First use or removed dependencies. */ }

if (installed && previous?.fingerprint === fingerprint) {
  console.log('依赖已就绪，使用现有安装。');
} else {
  console.log('正在按 package-lock.json 安装依赖；首次启动或依赖变更时执行。');
  // Only a fixed command is passed to the Windows shell; no file/user content is interpolated.
  const result = spawnSync('npm', ['ci'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) {
    console.error('无法运行 npm：' + result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
  writeFileSync(marker, JSON.stringify({ fingerprint, nodeMajor: major }, null, 2) + '\n');
  console.log('依赖准备完成。');
}

