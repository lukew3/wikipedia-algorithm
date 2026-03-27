# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Use **bun** for all package management and scripts (not npm):

```bash
bun install           # Install dependencies
bun run dev          # Start dev server (http://localhost:5173 with HMR)
bun run build        # Compile TypeScript and build Vite bundle → dist/
bun run lint         # Run ESLint on all TypeScript/TSX files
bun run preview      # Preview production build locally
```

## Architecture Overview

WikiLayer is a React app that recommends Wikipedia articles based on reading behavior and content analysis.

### State Management (Jotai)

Atoms in `src/atoms/` manage three main categories:
- **Session state** (`sessionAtom.ts`): Active article, scroll depth, session timer
- **History** (`historyAtom.ts`): Persisted reading history and session records
- **UI & recommendations** (`recommendationsAtom.ts`, `uiAtom.ts`, `preferencesAtom.ts`): Panel visibility, recommendations, user settings

Session data (scroll depth, time spent) flows from hooks → active session atom → history atom (on navigation).

### Core Flow

1. **Search/Browse** → user navigates to article via search bar or random
2. **Read** → article content loaded, scroll depth tracked via `useScrollDepth` hook
3. **Recommend** → `useRecommendations` hook computes suggestions based on:
   - **Category similarity** (Jaccard distance between article categories)
   - **Link-based scoring** (relatedness via Wikipedia's "more like" feature)
   - **Reading path context** (articles in current session/history)
4. **Track History** → session stored in `historyAtom` when navigating away

### Recommendation Algorithm

Located in `src/algorithms/`:
- **scoring.ts**: Jaccard similarity, rank normalization, category filtering
- **nextPage.ts**: Combines category/link similarity with morelike search to rank candidates
- **randomDiscovery.ts**: Random article fetching

The algorithm filters noisy categories (e.g., "Articles requiring X") to focus on semantic content.

### Data Sources

- **Wikipedia API** (`src/api/wikipedia.ts`): Wraps `wikipedia` npm package for search, summaries, links, categories, morelike queries
- **Local state**: Reading history persisted in atoms (not a database)

### Component Organization

```
src/components/
  ├── layout/         AppShell (router outlet), Navbar, SearchBar
  ├── reader/         ArticleContent, ReadProgressBar, RecommendationPanel
  ├── history/        SessionList, NetworkGraph
  ├── resume/         ResumeBanner (resume interrupted article)
  └── common/         ErrorBoundary, Spinner
```

Pages (`src/pages/`) are mounted by React Router; they coordinate state and components.

### Route Structure

- `/` — HomePage (search, featured article, random discovery)
- `/wiki/:title` — ArticlePage (reader view with recommendations)
- `/history` — HistoryPage (sessions, network graph)

## TypeScript & Build Configuration

- **Target**: ES2023, strict mode, no unused variables/parameters
- **Module alias**: `@/` maps to `src/` (configured in vite.config.ts and tsconfig.app.json)
- **Import style**: Named ESM imports; the wikipedia package has CJS interop handled in `api/wikipedia.ts`
- **React 19**: React-refresh for HMR, React Router v7 for client-side routing

## Development Notes

- **No test suite** is configured; focus on manual testing and eslint compliance
- **Data persistence**: Currently atoms only (no backend). History is session-scoped or local storage if implemented later
- **Font icons**: Font Awesome for UI icons (free-solid-svg-icons)
- **Network visualization**: react-force-graph-2d with Three.js backend for session history graphs
