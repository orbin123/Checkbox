# Checkbox

A minimal, distraction-free desktop app for tracking progress across playlists, courses, and learning sprints — built with Electron, React, and Zustand.

![Checkbox](checkbox-app/public/favicon.svg)

## Features

- **Workspaces** — Organize trackers into tabbed workspaces. Double-click a tab to rename it.
- **Checkbox Tables** — Create numbered checkbox grids (up to 200 items) to track linear progress through any list.
- **Smart Preview** — Large tables auto-collapse to show a 2-row window around your current progress.
- **Linear Ticking** — Checkboxes enforce sequential completion — check the next, uncheck the last.
- **Progress Tracking** — Each table shows a live progress bar with completion count and percentage.
- **Persistent Storage** — Data persists via `electron-store` (desktop) or `localStorage` (browser).
- **Keyboard Shortcut** — Press `⌘/Ctrl + N` to quickly create a new workspace.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | [Electron](https://www.electronjs.org/) |
| Frontend    | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| State       | [Zustand](https://zustand.docs.pmnd.rs/) |
| Storage     | [electron-store](https://github.com/sindresorhus/electron-store) / localStorage |
| Icons       | [Lucide React](https://lucide.dev/) |
| Styling     | Vanilla CSS with CSS custom properties |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Install Dependencies

```bash
cd checkbox-app
npm install
```

### Development

**Browser mode** (hot-reload, no Electron):

```bash
npm run dev
```

**Electron mode** (full desktop app):

```bash
npm run electron:dev
```

### Build

**macOS (.dmg):**

```bash
npm run electron:build
```

**Windows (.exe):**

```bash
npm run electron:build:win
```

**Linux (.AppImage):**

```bash
npm run electron:build:linux
```

Built artifacts are output to the `checkbox-app/release/` directory.

> **Note:** Distributing to other users on macOS requires code signing with an Apple Developer certificate. Unsigned apps work on your own machine.

## Project Structure

```
checkbox-app/
├── electron/
│   ├── main.cjs          # Electron main process
│   └── preload.cjs       # Context bridge for IPC
├── src/
│   ├── App.jsx           # Root component & routing logic
│   ├── App.css           # All application styles
│   ├── index.css         # CSS reset & design tokens
│   ├── main.jsx          # React entry point
│   ├── store/
│   │   └── store.js      # Zustand store (state + persistence)
│   └── components/
│       ├── TabBar.jsx     # Workspace tab navigation
│       ├── TableCard.jsx  # Individual tracker card
│       ├── CheckboxGrid.jsx  # Checkbox grid renderer
│       ├── ProgressBar.jsx   # Progress bar display
│       ├── AddTableForm.jsx  # New table creation form
│       ├── EmptyState.jsx    # Welcome / no-workspace screen
│       └── ConfirmDialog.jsx # Delete confirmation modal
├── package.json
└── vite.config.js
```

## License

MIT
