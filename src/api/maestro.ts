import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type {
  Cluster,
  Agent,
  Task,
  TaskExecution,
  DebugTask,
  PaginatedResponse,
  CreateClusterRequest,
  UpdateClusterRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  ReorderTasksRequest,
  CreateDebugTaskRequest,
  ExecutionFilters,
  HealthResponse,
} from '../types/maestro'

export const clustersApi = {
  list: (limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<Cluster>>('/clusters', { limit, offset }),

  create: (data: CreateClusterRequest) =>
    apiPost<Cluster>('/clusters', data),

  get: (id: string) =>
    apiGet<Cluster>(`/clusters/${id}`),

  update: (id: string, data: UpdateClusterRequest) =>
    apiPut<Cluster>(`/clusters/${id}`, data),

  delete: (id: string) =>
    apiDelete<void>(`/clusters/${id}`),
}

export const agentsApi = {
  listByCluster: (clusterId: string, limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<Agent>>(`/clusters/${clusterId}/agents`, { limit, offset }),

  get: (id: string) =>
    apiGet<Agent>(`/agents/${id}`),

  delete: (id: string) =>
    apiDelete<void>(`/agents/${id}`),

  getExecutions: (id: string, limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<TaskExecution>>(`/agents/${id}/executions`, { limit, offset }),
}

export const tasksApi = {
  listByCluster: (clusterId: string, limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<Task>>(`/tasks`, { cluster_id: clusterId, limit, offset }),

  create: (data: CreateTaskRequest) =>
    apiPost<Task>(`/tasks`, data),

  get: (id: string) =>
    apiGet<Task>(`/tasks/${id}`),

  update: (id: string, data: UpdateTaskRequest) =>
    apiPut<Task>(`/tasks/${id}`, data),

  delete: (id: string) =>
    apiDelete<void>(`/tasks/${id}`),

  reorder: (data: ReorderTasksRequest) =>
    apiPost<void>(`/tasks/reorder`, data),

  resetExecutions: (id: string) =>
    apiPost<void>(`/tasks/${id}/reset-executions`, {}),

  getExecutions: (taskId: string, limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<TaskExecution>>(`/tasks/${taskId}/executions`, { limit, offset }),
}

export const executionsApi = {
  list: (filters?: ExecutionFilters) =>
    apiGet<PaginatedResponse<TaskExecution>>('/executions', filters as Record<string, string | number | boolean | undefined>),

  get: (id: string) =>
    apiGet<TaskExecution>(`/executions/${id}`),
}

export const debugTasksApi = {
  create: (data: CreateDebugTaskRequest) =>
    apiPost<DebugTask>(`/debug-tasks`, data),

  get: (id: string) =>
    apiGet<DebugTask>(`/debug-tasks/${id}`),

  listByAgent: (agentId: string, limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<DebugTask>>(`/agents/${agentId}/debug-tasks`, { limit, offset }),
}

export const healthApi = {
  check: () =>
    apiGet<HealthResponse>('/health'),
}
