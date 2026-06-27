import { Client } from '@notionhq/client';
import { existsSync, readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
loadLocalEnv(path.join(ROOT, '.env.local'));

const YEAR = Number(process.env.UPDATE_YEAR || '2026');
const REPORT_START_DATE = `${YEAR}-05-03`;
const DOWNLOAD_MEDIA = (process.env.NOTION_DOWNLOAD_MEDIA || 'true') !== 'false';
const notionToken = process.env.NOTION_TOKEN;

const PAGES = {
  weeklyRoot: process.env.NOTION_ROBOTICS_ROOT_PAGE_ID || '35c68db0a61c80fcade6c0b5e9ae0633',
  mengfei: process.env.NOTION_MENGFEI_PAGE_ID || '2df68db0a61c80c2b820ec5706e5750b',
  yikai: process.env.NOTION_YIKAI_PAGE_ID || '30168db0a61c80a690e8cb41c24ade6b'
};

if (!notionToken) {
  console.error('Missing NOTION_TOKEN. Copy .env.example to .env.local or set env vars in CI/Vercel.');
  process.exit(1);
}

const notion = new Client({ auth: notionToken });

function loadLocalEnv(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsAt = trimmed.indexOf('=');
    if (equalsAt === -1) continue;
    const key = trimmed.slice(0, equalsAt).trim();
    const rawValue = trimmed.slice(equalsAt + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
  }
}

function normalizeId(id) {
  return id.replace(/-/g, '');
}

function pageUrl(id) {
  return `https://app.notion.com/p/${normalizeId(id)}`;
}

function richTextToPlain(richText = []) {
  return richText.map((rt) => rt.plain_text || '').join('').trim();
}

function getTitleFromPage(page) {
  const props = page.properties || {};
  for (const value of Object.values(props)) {
    if (value?.type === 'title') return richTextToPlain(value.title) || 'Untitled';
  }
  return 'Untitled';
}

function blockText(block) {
  const payload = block[block.type];
  if (!payload) return '';
  if (Array.isArray(payload.rich_text)) return richTextToPlain(payload.rich_text);
  if (block.type === 'child_page') return payload.title || '';
  return '';
}

function dateFromText(text) {
  const normalized = text.replace(/^#+\s*/, '').trim();
  const match = normalized.match(/(?:^|\s)(\d{1,2})[./-](\d{1,2})(?:\s|$|[:：])/);
  if (!match) return null;
  return makeDate(Number(match[1]), Number(match[2]));
}

function weekFromDate(date) {
  if (!date) return 'undated';
  return date;
}

function makeDate(month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(YEAR, month - 1, day));
  if (date.getUTCFullYear() !== YEAR || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${YEAR}-${mm}-${dd}`;
}

function dateToTime(date) {
  if (!date || date === 'undated' || date.startsWith('older')) return null;
  const time = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(time) ? null : time;
}

function shiftDate(date, days) {
  const time = dateToTime(date);
  if (time === null) return null;
  const shifted = new Date(time + days * 24 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

function parsePeriodRange(title) {
  const match = title.match(/(\d{1,2})[./-](\d{1,2})(?:\s*[–—-]\s*(\d{1,2})[./-](\d{1,2}))?/);
  if (!match) return null;
  const startDate = makeDate(Number(match[1]), Number(match[2]));
  if (!startDate) return null;
  const explicitEnd = match[3] && match[4] ? makeDate(Number(match[3]), Number(match[4])) : null;
  return {
    startDate,
    endDate: explicitEnd || shiftDate(startDate, 7),
    label: match[0]
  };
}

function prettyPeriod(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const startLabel = `${start.getUTCMonth() + 1}/${start.getUTCDate()}`;
  const endLabel = `${end.getUTCMonth() + 1}/${end.getUTCDate()}`;
  return `${startLabel}-${endLabel}`;
}

function inferTags(text) {
  const t = text.toLowerCase();
  const tags = [];
  const rules = [
    ['taskgen', 'TaskGen'],
    ['booster', 'Booster'],
    ['teleop', 'Teleoperation'],
    ['drag', 'Teleoperation'],
    ['dagger', 'DAgger'],
    ['recover', 'Recovery'],
    ['failure', 'Recovery'],
    ['checker', 'Checker'],
    ['verify', 'Verify'],
    ['replay', 'Replay'],
    ['random', 'Randomization'],
    ['dataset', 'Dataset'],
    ['model', 'Model'],
    ['training', 'Model'],
    ['heatmap', 'Heatmap'],
    ['articulated', 'Articulated objects'],
    ['mujoco', 'MuJoCo'],
    ['roboverse', 'RoboVerse'],
    ['multi', 'Multi-embodiment']
  ];
  for (const [needle, tag] of rules) {
    if (t.includes(needle) && !tags.includes(tag)) tags.push(tag);
  }
  return tags.slice(0, 5);
}

function mediaFromBlock(block) {
  if (!['image', 'video', 'file', 'pdf'].includes(block.type)) return null;
  const payload = block[block.type];
  if (!payload) return null;
  const type = block.type === 'image' ? 'image' : block.type === 'video' ? 'video' : 'file';
  let url;
  let originalName;
  if (payload.type === 'file') {
    url = payload.file?.url;
  } else if (payload.type === 'external') {
    url = payload.external?.url;
  }
  originalName = payload.name || guessNameFromUrl(url) || `${block.id}.${type === 'image' ? 'png' : type === 'video' ? 'mp4' : 'bin'}`;
  return url ? { type, url, originalName, notionBlockId: block.id } : null;
}

function guessNameFromUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const base = decodeURIComponent(path.basename(u.pathname));
    return base && base.includes('.') ? base : null;
  } catch {
    return null;
  }
}

function extFor(media) {
  const name = media.originalName || '';
  const ext = path.extname(name).replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
  if (ext) return ext;
  if (media.type === 'image') return '.png';
  if (media.type === 'video') return '.mp4';
  return '.bin';
}

async function downloadMedia(media, owner, date) {
  if (!DOWNLOAD_MEDIA || !media.url) return media;
  const mediaDir = path.join(ROOT, 'public', 'media', 'notion', owner.toLowerCase(), date || 'undated');
  await fs.mkdir(mediaDir, { recursive: true });
  const stable = media.notionBlockId || crypto.createHash('sha1').update(media.url).digest('hex').slice(0, 12);
  const filename = `${stable.replace(/-/g, '')}${extFor(media)}`;
  const outPath = path.join(mediaDir, filename);
  try {
    const res = await fetch(media.url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    await fs.writeFile(outPath, Buffer.from(arrayBuffer));
    return { ...media, url: `/media/notion/${owner.toLowerCase()}/${date || 'undated'}/${filename}` };
  } catch (err) {
    console.warn(`Could not download media ${media.originalName || media.url}: ${err.message}`);
    return media;
  }
}

async function listChildren(blockId) {
  let results = [];
  let cursor;
  do {
    const resp = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
    results = results.concat(resp.results);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function flattenPage(pageId, depth = 0) {
  const blocks = await listChildren(pageId);
  const out = [];
  for (const block of blocks) {
    out.push(block);
    if (block.has_children && depth < 2 && block.type !== 'child_page') {
      const children = await flattenPage(block.id, depth + 1);
      out.push(...children);
    }
  }
  return out;
}

function sentenceClean(text) {
  return text.replace(/\s+/g, ' ').replace(/<br\s*\/?>/gi, ' ').trim();
}

function smartTitle(caption, owner, date) {
  const clean = sentenceClean(caption);
  if (!clean) return `${owner} demo ${date || ''}`.trim();
  const first = clean.split(/[。.!?]/)[0].slice(0, 86).trim();
  return first || `${owner} demo ${date || ''}`.trim();
}

async function extractDemosFromWorkPage(pageId, owner) {
  const blocks = await flattenPage(pageId);
  let currentDate = 'undated';
  let recentText = [];
  const demos = [];
  let lastMediaDemo = null;

  for (const block of blocks) {
    const text = sentenceClean(blockText(block));
    const maybeDate = dateFromText(text);
    if (maybeDate) {
      currentDate = maybeDate;
      recentText = [];
      lastMediaDemo = null;
    }

    const mediaRaw = mediaFromBlock(block);
    if (mediaRaw) {
      const media = await downloadMedia(mediaRaw, owner, currentDate);
      const caption = recentText.join(' · ') || `${owner} media from ${currentDate}`;
      const captionKey = caption.slice(0, 120);
      if (lastMediaDemo && lastMediaDemo.date === currentDate && lastMediaDemo.captionKey === captionKey) {
        lastMediaDemo.media.push(media);
      } else {
        const idSeed = `${owner}-${currentDate}-${block.id}`;
        const demo = {
          id: crypto.createHash('sha1').update(idSeed).digest('hex').slice(0, 12),
          date: currentDate,
          weekId: weekFromDate(currentDate),
          owner,
          title: smartTitle(caption, owner, currentDate),
          caption,
          captionKey,
          tags: inferTags(caption),
          media: [media],
          sourceUrl: pageUrl(pageId)
        };
        demos.push(demo);
        lastMediaDemo = demo;
      }
    } else if (text) {
      if (block.type !== 'child_page') {
        recentText.push(text);
        recentText = recentText.slice(-3);
        lastMediaDemo = null;
      }
    }
  }

  return demos.map(({ captionKey, ...demo }) => demo);
}

async function extractWeeklyPages(rootPageId) {
  const rootBlocks = await listChildren(rootPageId);
  const childPages = rootBlocks.filter((b) => b.type === 'child_page');
  const weekly = [];
  for (const child of childPages) {
    const title = child.child_page.title || 'Weekly Update';
    const id = child.id;
    const blocks = await flattenPage(id);
    const texts = blocks.map(blockText).map(sentenceClean).filter(Boolean).filter((t) => !dateFromText(t));
    const periodRange = parsePeriodRange(title);
    if (!periodRange || periodRange.startDate < REPORT_START_DATE) continue;
    weekly.push({
      id: periodRange.startDate,
      title,
      period: periodRange.label,
      startDate: periodRange.startDate,
      endDate: periodRange.endDate,
      sourceUrl: pageUrl(id),
      summary: texts.slice(0, 8),
      demos: []
    });
  }
  return weekly;
}

function mergeDemosIntoWeeks(weeklyPages, demos) {
  const weeks = weeklyPages
    .map((w) => ({ ...w, demos: [] }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  for (const demo of demos.filter((d) => dateToTime(d.date) !== null && d.date >= REPORT_START_DATE)) {
    const targetWeek = findWeekForDemo(weeks, demo.date) || createSyntheticWeek(weeks, demo.date, demo.sourceUrl);
    targetWeek.demos.push({ ...demo, weekId: targetWeek.id });
  }

  for (const w of weeks) {
    w.demos = dedupeDemos(w.demos).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
    if (!w.summary.length && w.demos.length) {
      w.summary = summarizeDemos(w.demos);
    }
  }

  return weeks.filter((w) => w.summary.length || w.demos.length);
}

function findWeekForDemo(weeks, date) {
  const demoTime = dateToTime(date);
  if (demoTime === null) return null;
  const day = 24 * 60 * 60 * 1000;
  for (let i = weeks.length - 1; i >= 0; i -= 1) {
    const week = weeks[i];
    const start = dateToTime(week.startDate);
    const nextStart = weeks[i + 1] ? dateToTime(weeks[i + 1].startDate) : null;
    const end = dateToTime(week.endDate);
    if (start === null || end === null) continue;

    if (nextStart !== null && demoTime >= start && demoTime < nextStart) return week;
    if (nextStart === null && demoTime >= start && demoTime <= end + day) return week;
  }

  return weeks.find((week) => {
    const start = dateToTime(week.startDate);
    return start !== null && demoTime >= start - day && demoTime < start;
  }) || null;
}

function createSyntheticWeek(weeks, date, sourceUrl) {
  const time = dateToTime(date);
  const start = new Date(time);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const startDate = start.toISOString().slice(0, 10);
  const existing = weeks.find((w) => w.id === startDate);
  if (existing) return existing;
  const endDate = shiftDate(startDate, 7);
  const week = {
    id: startDate,
    title: `Progress Update ${prettyPeriod(startDate, endDate)}`,
    period: prettyPeriod(startDate, endDate),
    startDate,
    endDate,
    sourceUrl,
    summary: [],
    demos: []
  };
  weeks.push(week);
  weeks.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return week;
}

function demoFingerprint(demo) {
  const text = `${demo.date} ${demo.title} ${demo.caption}`
    .toLowerCase()
    .replace(/\d+/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .slice(0, 120);
  return `${demo.date}:${text || demo.media.map((m) => m.url).join('|')}`;
}

function dedupeDemos(demos) {
  const seen = new Set();
  const deduped = [];
  for (const demo of demos) {
    const key = demoFingerprint(demo);
    if (seen.has(key)) {
      const previous = deduped.find((d) => demoFingerprint(d) === key);
      if (previous) previous.media.push(...demo.media);
      continue;
    }
    seen.add(key);
    deduped.push({ ...demo, media: [...demo.media] });
  }
  return deduped;
}

function summarizeDemos(demos) {
  const topics = Array.from(new Set(demos.flatMap((d) => d.tags))).slice(0, 5);
  const summary = topics.length
    ? `This week, the robotics team pushed forward ${topics.join(', ')} through implementation work and demos.`
    : 'This week, the robotics team continued implementation work and captured demo evidence in the progress notes.';
  return [summary];
}

async function main() {
  console.log('Fetching Notion pages...');
  const [weekly, mengfeiDemos, yikaiDemos] = await Promise.all([
    extractWeeklyPages(PAGES.weeklyRoot),
    extractDemosFromWorkPage(PAGES.mengfei, 'Mengfei'),
    extractDemosFromWorkPage(PAGES.yikai, 'Yikai')
  ]);

  const weeklyUpdates = mergeDemosIntoWeeks(weekly, [...mengfeiDemos, ...yikaiDemos]);
  const demoItems = weeklyUpdates.reduce((acc, w) => acc + w.demos.length, 0);
  const mediaItems = weeklyUpdates.reduce((acc, w) => acc + w.demos.reduce((dacc, d) => dacc + d.media.length, 0), 0);
  const lastUpdate = weeklyUpdates.at(-1)?.id || 'unknown';
  const data = {
    generatedAt: new Date().toISOString(),
    sources: {
      weeklyRoot: pageUrl(PAGES.weeklyRoot),
      mengfei: pageUrl(PAGES.mengfei),
      yikai: pageUrl(PAGES.yikai)
    },
    stats: { weeklyUpdates: weeklyUpdates.length, demoItems, mediaItems, lastUpdate },
    weeklyUpdates
  };

  const outPath = path.join(ROOT, 'src', 'data', 'siteData.json');
  await fs.writeFile(outPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Wrote ${outPath}`);
  console.log(`Weeks: ${weeklyUpdates.length}, demos: ${demoItems}, media: ${mediaItems}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
