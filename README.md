# Axis Robotics Live Updates

A Notion-grounded live website for Robotics Team weekly updates and demos.

The goal is to solve the knowledge-decay problem described in the chat: instead of manually copying Zagen/推特-style summaries into an agent, the team maintains Notion pages and this site continuously turns them into a clean, browsable, agent-friendly dashboard.

## What it does

- Reads the weekly `Robotics Team Tech Updates` root page.
- Reads Mengfei and Yikai work-progress pages.
- Extracts text, images, videos, files, and nearby captions.
- Groups demo media by date/week.
- Downloads private Notion media into `public/media/notion` so static deployments do not break when Notion signed URLs expire.
- Builds a website with weekly summaries, demo cards, owner labels, source links, and tags.
- Optional Basic Auth for internal-only deployment.

## Pages already configured

```env
NOTION_ROBOTICS_ROOT_PAGE_ID=35c68db0a61c80fcade6c0b5e9ae0633
NOTION_MENGFEI_PAGE_ID=2df68db0a61c80c2b820ec5706e5750b
NOTION_YIKAI_PAGE_ID=30168db0a61c80a690e8cb41c24ade6b
```

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add NOTION_TOKEN
npm run ingest
npm run dev
```

Open `http://localhost:3000`.

## Notion permission setup

1. Create an internal Notion integration.
2. Copy the integration secret into `NOTION_TOKEN`.
3. Open each Notion page and invite/share it with the integration:
   - Robotics Team Tech Updates
   - AI产品交付记录-Mengfei
   - Work Progress—yikai
4. Run `npm run ingest`.

If videos/images do not show, the integration probably does not have access to the page/block where those files live.

## Deploy option A: Vercel, easiest

1. Push this folder to a GitHub repo.
2. Import the repo into Vercel.
3. Add environment variables from `.env.example`.
4. Set build command:

```bash
npm run ingest && npm run build
```

5. For Basic Auth on Vercel, rename `middleware.example.ts` to `middleware.ts`, then add `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` before sharing the URL.

## Deploy option B: GitHub Pages

This repo includes `.github/workflows/deploy.yml`. It runs `npm run ingest`, downloads the Notion media, builds a static site, and deploys to GitHub Pages.

Add this repository secret:

- `NOTION_TOKEN`

Then enable GitHub Pages from Actions. Note: GitHub Pages is static and cannot enforce the included Basic Auth middleware. Use Vercel/Cloudflare/Netlify with access control, or a private VPN/internal hosting setup, for confidential demos.

## Important privacy note

`npm run ingest` copies Notion media into `public/media/notion`. Do not deploy this to a public website unless the team is comfortable exposing internal demos. The included `middleware.example.ts` Basic Auth works on server deployments such as Vercel after renaming it to `middleware.ts`; it does not work on static GitHub Pages.

## How the agent should use it

The rendered website is human-readable, but the source data is also stored in:

```text
src/data/siteData.json
```

Agents can ingest this JSON directly and preserve source URLs back to Notion.

## Files to edit later

- `scripts/ingest-notion.mjs`: Notion parsing/grouping logic.
- `src/app/page.tsx`: website layout.
- `src/app/globals.css`: visual design.
- `src/data/siteData.json`: generated data; do not manually edit after live ingestion is set up.
