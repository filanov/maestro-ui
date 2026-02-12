# Maestro UI

Web interface for the [Maestro](https://github.com/filanov/maestro) distributed task orchestration system.

## Features

- 📊 **Cluster Management** - Create and manage orchestration clusters
- 🤖 **Agent Monitoring** - Real-time agent health and status tracking
- 📋 **Task Management** - View ordered task lists per cluster
- 🔍 **Execution Monitoring** - Filter and track task executions
- 🐛 **Debug Console** - Run one-off commands on specific agents

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Maestro backend service running (default: `http://localhost:8080`)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The dev server proxies API requests to `http://localhost:8080` by default. Change `VITE_API_URL` in `.env.development` if your backend runs elsewhere.

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management
- **React Router** - Client-side routing

## Project Structure

```
src/
├── api/           # API client and typed endpoints
├── types/         # TypeScript type definitions
├── components/    # Reusable UI components
├── pages/         # Route components
└── main.tsx       # Application entry point
```

## Configuration

Environment variables (`.env.development`, `.env.production`):

- `VITE_API_URL` - Maestro backend URL

## License

MIT