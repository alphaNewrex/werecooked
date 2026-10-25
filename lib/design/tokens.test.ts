import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { tokens } from './index';

const root = path.resolve(__dirname, '..', '..');
const generator = path.join(root, 'scripts/build-theme-css.mjs');
const globalCss = path.join(root, 'global.css');

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

describe('design token CSS generation', () => {
  it('contains every light and dark color token', () => {
    const css = readFileSync(globalCss, 'utf8');
    for (const scheme of ['light', 'dark'] as const) {
      for (const name of Object.keys(tokens.colors[scheme])) {
        expect(css).toContain(`--color-${kebabCase(name)}:`);
      }
    }
  });

  it('passes the drift check', () => {
    expect(() => execFileSync('node', [generator, '--check'], { cwd: root, stdio: 'pipe' })).not.toThrow();
  });

  it('fails the drift check when the CSS is modified', () => {
    const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'cookfood-tokens-'));
    const tempFile = path.join(tempDirectory, 'global.css');
    try {
      cpSync(globalCss, tempFile);
      writeFileSync(tempFile, readFileSync(tempFile, 'utf8').replace('--color-bg: 246 247 241;', '--color-bg: 0 0 0;'));
      expect(() => execFileSync('node', [generator, '--check', '--file', tempFile], { cwd: root, stdio: 'pipe' })).toThrow();
    } finally {
      rmSync(tempDirectory, { recursive: true, force: true });
    }
  });
});
