# WikiLayer

A personal Wikipedia reading companion with intelligent article recommendations and reading progress tracking.

## Features

- **Article Search & Reading** — Search Wikipedia and read articles with scroll-based progress tracking
- **Smart Recommendations** — Discover related articles based on content analysis and reading patterns
- **Reading History** — Resume interrupted articles, track reading time and completion percentage
- **Featured Articles** — Curated daily featured article from Wikipedia
- **Session Analytics** — View network graphs of your reading journey and session history
- **Random Discovery** — Explore unexpected articles with a single click

## Getting Started

### Prerequisites

- Node.js 18+ (uses [Bun](https://bun.sh) for package management)

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

Opens at `http://localhost:5173` with hot module reloading.

### Building

```bash
bun run build
```

Produces optimized production bundle in the `dist` directory.

### Linting

```bash
bun run lint
```

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool with HMR
- **React Router v7** — Client-side routing
- **Jotai** — Lightweight state management
- **Wikipedia API** — Article data and recommendations
- **React Force Graph** — Network visualization of article relationships

## Project Structure

```
src/
  ├── pages/          # Route pages (Home, Article, History)
  ├── components/     # React components (layout, reader, history, etc.)
  ├── hooks/          # Custom React hooks (scroll tracking, recommendations)
  ├── algorithms/     # Recommendation & scoring algorithms
  ├── api/            # Wikipedia API integration
  ├── atoms/          # Jotai state atoms
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions
  └── App.tsx         # Root component
```

## How It Works

1. **Search or Browse** — Find articles via search or random selection
2. **Read** — Progress is tracked automatically as you scroll
3. **Get Recommendations** — Algorithm suggests related articles based on content and your reading history
4. **Track History** — Session data is saved locally, allowing you to resume and view your reading patterns
