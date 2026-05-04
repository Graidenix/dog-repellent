#!/usr/bin/env bun

function git(...args: string[]): string {
  const { stdout } = Bun.spawnSync(['git', ...args], { stdout: 'pipe', stderr: 'pipe' });
  return stdout.toString().trim();
}

// x — number of git tags
const x = git('tag').split('\n').filter(Boolean).length;

// Reference point: most recent tag ref, or null when no tags exist
let lastTagRef: string | null = null;
if (x > 0) {
  lastTagRef = git('for-each-ref', '--sort=-creatordate', '--format=%(refname:short)', 'refs/tags').split('\n')[0];
}

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// y — number of distinct days with at least one commit since the last tag
const yRange = lastTagRef ? [`${lastTagRef}..HEAD`] : [];
const commitDays = new Set(
  git('log', '--format=%cd', '--date=short', ...yRange).split('\n').filter(Boolean),
);
const y = Math.max(0, commitDays.size - 1);
const z = git('log', '--oneline', `--after=${today} 00:00:00`)
  .split('\n')
  .filter(Boolean).length;

const version = `${x}.${y}.${z}`;

const pkgPath = `${import.meta.dir}/../package.json`;
const pkg = await Bun.file(pkgPath).json();
pkg.version = version;
await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`version → ${version}`);
