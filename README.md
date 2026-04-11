# Browser Tab Management Tool

A front-end only MVP for visual browser tab management.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts

## Features

- Import sources:
  - OneTab text
  - Bookmark HTML
  - Chrome/Edge file (JSON/HTML/TXT, phase-2 entry)
- Unified parse pipeline:
  - `parse -> normalize -> dedupe -> categorize -> store`
- Data model:
  - title, url, domain, source, category, hash, duplicate status
- Visualization:
  - List view (search, category filter, duplicate filter)
  - Category board
  - Stats charts (category and source distribution)
- Persistence:
  - Local storage with state versioning

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build and Test

```bash
npm run build
npm run test
```

## Example OneTab Text

```text
https://github.com | GitHub
MDN | https://developer.mozilla.org
https://news.ycombinator.com | Hacker News
```
