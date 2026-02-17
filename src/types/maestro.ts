export interface Cluster {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  cluster_id: string
  hostname: string
  status: 'active' | 'inactive'
  last_heartbeat: string
  registered_at: string
  last_reset_at: string
}

export interface TaskConfig {
  command: string
  timeout_seconds?: number
  working_dir?: string
}

export interface Task {
  id: string
  cluster_id: string
  name: string
  type: 'exec' | 'bash'
  order: number
  blocking: boolean
  config: TaskConfig
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TaskExecution {
  id: string
  agent_id: string
  task_id: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  output: string
  exit_code: number | null
  error: string
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface DebugTask {
  id: string
  agent_id: string
  command: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  output: string
  exit_code: number | null
  error: string
  created_at: string
  completed_at: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export interface CreateClusterRequest {
  name: string
  description?: string
}

export interface UpdateClusterRequest {
  name?: string
  description?: string
}

export interface CreateTaskRequest {
  cluster_id: string
  name: string
  type: 'exec' | 'bash'
  config: TaskConfig
  blocking?: boolean
}

export interface UpdateTaskRequest {
  name?: string
  type?: 'exec' | 'bash'
  config?: TaskConfig
  blocking?: boolean
}

export interface ReorderTasksRequest {
  cluster_id: string
  task_ids: string[]
}

export interface CreateDebugTaskRequest {
  agent_id: string
  command: string
}

export interface ExecutionFilters {
  cluster_id?: string
  agent_id?: string
  task_id?: string
  status?: TaskExecution['status']
  limit?: number
  offset?: number
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
}

export interface Template {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface TemplateTask {
  id: string
  template_id: string
  name: string
  type: 'exec' | 'bash'
  order: number
  blocking: boolean
  config: TaskConfig
  created_at: string
  updated_at: string
}

export interface CreateTemplateRequest {
  name: string
  description?: string
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
}

export interface CreateTemplateTaskRequest {
  name: string
  type: 'exec' | 'bash'
  config: TaskConfig
  blocking?: boolean
}

export interface UpdateTemplateTaskRequest {
  name?: string
  type?: 'exec' | 'bash'
  config?: TaskConfig
  blocking?: boolean
}

export interface ReorderTemplateTasksRequest {
  template_id: string
  task_ids: string[]
}

export interface ImportTemplateRequest {
  template_id: string
}

export interface ImportTemplateResponse {
  message: string
  tasks_imported: number
}

export interface ExportTemplateRequest {
  template_name: string
  template_description?: string
  task_ids?: string[]
}
