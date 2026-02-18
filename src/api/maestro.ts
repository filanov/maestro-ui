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
  Template,
  TemplateTask,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateTemplateTaskRequest,
  UpdateTemplateTaskRequest,
  ReorderTemplateTasksRequest,
  ImportTemplateRequest,
  ImportTemplateResponse,
  ExportTemplateRequest,
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

  importTemplate: (clusterId: string, data: ImportTemplateRequest) =>
    apiPost<ImportTemplateResponse>(`/clusters/${clusterId}/import-template`, data),

  exportTemplate: (clusterId: string, data: ExportTemplateRequest) =>
    apiPost<Template>(`/clusters/${clusterId}/export-template`, data),
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

  resetExecutionForAgent: (taskId: string, agentId: string) =>
    apiPost<void>(`/tasks/${taskId}/reset-executions/agents/${agentId}`, {}),

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

export const templatesApi = {
  list: (limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<Template>>('/templates', { limit, offset }),

  create: (data: CreateTemplateRequest) =>
    apiPost<Template>('/templates', data),

  get: (id: string) =>
    apiGet<Template>(`/templates/${id}`),

  update: (id: string, data: UpdateTemplateRequest) =>
    apiPut<Template>(`/templates/${id}`, data),

  delete: (id: string) =>
    apiDelete<void>(`/templates/${id}`),
}

export const templateTasksApi = {
  listByTemplate: (templateId: string, limit = 50, offset = 0) =>
    apiGet<PaginatedResponse<TemplateTask>>(`/templates/${templateId}/tasks`, { limit, offset }),

  create: (templateId: string, data: CreateTemplateTaskRequest) =>
    apiPost<TemplateTask>(`/templates/${templateId}/tasks`, data),

  update: (id: string, data: UpdateTemplateTaskRequest) =>
    apiPut<TemplateTask>(`/template-tasks/${id}`, data),

  delete: (id: string) =>
    apiDelete<void>(`/template-tasks/${id}`),

  reorder: (templateId: string, data: ReorderTemplateTasksRequest) =>
    apiPost<void>(`/templates/${templateId}/tasks/reorder`, data),
}
