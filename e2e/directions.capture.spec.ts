import { execFileSync } from 'node:child_process';
import { mkdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';

import { test, expect, type Browser, type Page } from '@playwright/test';

test.skip(!process.env.CAPTURE_DIRECTIONS, 'set CAPTURE_DIRECTIONS=1 to capture design directions');

const viewport = { width: 430, height: 932 };
const outputDirectory = path.join(process.cwd(), 'docs/design/directions');
const ffmpegPath = '/tmp/ff/node_modules/ffmpeg-static/ffmpeg';

function outputPath(direction: string, mode: string) {
  return path.join(outputDirectory, `${direction}-${mode}.png`);
}

async function captureScreenshots(browser: Browser, direction: string) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  for (const mode of ['light', 'dark']) {
    await openDirection(page, direction, mode);
    await expect(page.getByText('Chili Crunch Chicken Tenders')).toBeVisible({ timeout: 30_000 });
    await page.evaluate(() => {
      const scroll = document.getElementById('directions-scroll');
      if (!(scroll instanceof HTMLElement)) throw new Error('Directions scroll container was not found');
      scroll.style.height = `${scroll.scrollHeight}px`;
      scroll.style.maxHeight = 'none';
      scroll.style.overflow = 'visible';
    });
    await page.screenshot({ fullPage: true, path: outputPath(direction, mode) });
  }
  await context.close();
}

async function captureJobVideo(browser: Browser, direction: string) {
  const context = await browser.newContext({
    recordVideo: { dir: outputDirectory, size: viewport },
    viewport,
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await openDirection(page, direction, 'light');
  await expect(page.getByText('REEL JOB · 3 OF 6')).toBeVisible({ timeout: 30_000 });
  await page.getByText('02 / reel job').scrollIntoViewIfNeeded();
  await page.waitForTimeout(6_000);
  const video = page.video();
  await context.close();
  const webmPath = await video?.path();
  if (!webmPath) throw new Error(`No video was recorded for direction ${direction}`);

  const mp4Path = path.join(outputDirectory, `${direction}-job.mp4`);
  execFileSync(ffmpegPath, [
    '-y',
    '-i',
    webmPath,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-t',
    '6',
    mp4Path,
  ]);
  unlinkSync(webmPath);
}

async function openDirection(page: Page, direction: string, mode: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(`/dev/directions?d=${direction}&mode=${mode}`);
    await page.waitForLoadState('networkidle');
    if (await page.getByText('Chili Crunch Chicken Tenders').count()) return;
    await page.waitForTimeout(1_000);
  }
  throw new Error(`Could not load direction ${direction} in ${mode} mode`);
}

for (const direction of ['a', 'b', 'c']) {
  test(`${direction} direction captures`, async ({ browser }) => {
    test.setTimeout(180_000);
    mkdirSync(outputDirectory, { recursive: true });
    await captureScreenshots(browser, direction);
    await captureJobVideo(browser, direction);
  });
}
