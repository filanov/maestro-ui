# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**maestro-ui** is the web interface for the Maestro distributed task orchestration system.

**Purpose**: Provide a UI for managing clusters, agents, tasks, and monitoring execution status across up to 9,000 agents per cluster.

**Backend Integration**: Connects to the Maestro REST API (running on port 8080 by default).

**Key Capabilities to Build**:
- Cluster management (create, view, delete clusters)
- Agent monitoring (view registered agents, health status, execution history)
- Task management (create, reorder, update, delete tasks)
- Execution monitoring (view task executions with filtering by status/agent/task)
- Debug task submission (send one-off commands to specific agents)

## Backend REST API

The UI communicates with the Maestro service REST API at `http://localhost:8080`:

**Clusters**:
- `GET /clusters` - List all clusters
- `POST /clusters` - Create cluster
- `GET /clusters/{id}` - Get cluster details
- `DELETE /clusters/{id}` - Delete cluster

**Agents**:
- `GET /clusters/{cluster_id}/agents` - List agents in cluster
- `GET /agents/{id}` - Get agent details
- `DELETE /agents/{id}` - Remove agent
- `GET /agents/{id}/executions` - List agent's execution history

**Tasks**:
- `GET /clusters/{cluster_id}/tasks` - List cluster tasks (ordered)
- `POST /clusters/{cluster_id}/tasks` - Create task
- `GET /tasks/{id}` - Get task details
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `PUT /clusters/{cluster_id}/tasks/reorder` - Reorder tasks

**Executions**:
- `GET /executions` - List executions (supports filtering: `?cluster_id=X&agent_id=Y&task_id=Z&status=success`)
- `GET /executions/{id}` - Get execution details
- `GET /tasks/{task_id}/executions` - List executions for task

**Debug Tasks**:
- `POST /agents/{agent_id}/debug-tasks` - Create debug task
- `GET /debug-tasks/{id}` - Get debug task details
- `GET /agents/{agent_id}/debug-tasks` - List agent's debug tasks

**Health**:
- `GET /health` - Service health check

All list endpoints support pagination: `?limit=50&offset=0`

## Development Commands

**Prerequisites**: Node.js 20+ and npm

### Setup
```bash
npm install              # Install dependencies
```

### Development
```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### Environment Configuration

The app uses Vite environment variables:
- `.env.development` - Development config (proxies to localhost:8080)
- `.env.production` - Production config (direct API URL)

Change `VITE_API_URL` to point to your Maestro backend service.

## Architecture

### Tech Stack

**Frontend Framework**: React 18 + TypeScript
**Build Tool**: Vite 6
**Styling**: Tailwind CSS
**Data Fetching**: TanStack Query (React Query)
**Routing**: React Router v7
**Form Handling**: React Hook Form + Zod (ready to add)
**Drag & Drop**: dnd-kit (ready to add for task reordering)

### Project Structure

```
src/
├── api/
│   ├── client.ts          # Base HTTP client (fetch wrapper)
│   └── maestro.ts         # Typed API functions for all endpoints
├── types/
│   └── maestro.ts         # TypeScript types for Maestro entities
├── components/
│   └── Layout.tsx         # Main layout with navigation
├── pages/
│   ├── ClustersPage.tsx           # List/create clusters
│   ├── ClusterDetailPage.tsx     # View cluster agents and tasks
│   ├── AgentDetailPage.tsx       # Agent executions + debug console
│   └── ExecutionsPage.tsx        # Filterable execution history
├── main.tsx               # App entry point
├── App.tsx                # Router configuration
└── index.css              # Tailwind directives
```

### Backend Integration

The UI communicates with the Maestro REST API. In development, Vite proxies `/api/*` requests to `http://localhost:8080`.

**API Client** (`src/api/client.ts`):
- Generic HTTP methods: `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- Typed responses with error handling
- Custom `ApiError` class for HTTP errors

**API Modules** (`src/api/maestro.ts`):
- `clustersApi` - Cluster CRUD
- `agentsApi` - Agent management
- `tasksApi` - Task CRUD and reordering
- `executionsApi` - Execution queries
- `debugTasksApi` - Debug task management
- `healthApi` - Health check

### State Management

**Server State**: TanStack Query handles all API data
- Automatic caching and background refetching
- Agent status refreshes every 30s
- Executions refresh every 10s
- Debug tasks refresh every 5s

**Client State**: React component state (no global store needed yet)

### Implemented Features

✅ **Cluster Management**:
- List all clusters with pagination
- Create new clusters
- Delete clusters
- Navigate to cluster details

✅ **Cluster Detail View**:
- View agents in cluster with health status
- View tasks in cluster (ordered list)
- Auto-refresh agent status every 30s
- Link to agent details

✅ **Agent Detail View**:
- View agent info and connection status
- Debug console to run one-off commands
- List debug task history with live updates
- View task execution history
- Auto-refresh every 30s (agent) and 10s (executions)

✅ **Execution Monitoring**:
- Filterable table by status, agent, task, cluster
- Pagination support
- Status badges with color coding
- Auto-refresh every 10s

### To-Do Features

⏳ **Task Management** (High Priority):
- Create/edit/delete tasks UI
- Drag-and-drop task reordering (use dnd-kit)
- Blocking flag toggle
- Task detail modal

⏳ **Enhanced UX**:
- Loading skeletons instead of text
- Toast notifications for actions
- Confirmation modals for destructive actions
- Error boundary components

⏳ **Advanced Filtering**:
- Save filter presets
- Export execution data as CSV
- Real-time search across all fields

⏳ **Dashboard**:
- Cluster health overview
- Active agents count
- Recent execution statistics
- Success/failure rate charts

### Backend Context

Maestro is a pull-based task orchestration system where:
- Agents register with deterministic UUIDs (from cluster_id + hostname)
- Agents poll for ordered tasks and execute sequentially
- Tasks can be blocking (failure skips all subsequent tasks) or non-blocking
- Agents send heartbeats every minute; 3 missed heartbeats = disconnected
- Task executions are tracked per-agent with status: pending/running/success/failed/skipped
