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
  timeout_seconds: number
  working_dir?: string
}

export interface Task {
  id: string
  cluster_id: string
  name: string
  type: 'exec'
  order: number
  blocking: boolean
  config: TaskConfig
  created_at: string
  updated_at: string
}

export interface TaskExecution {
  id: string
  agent_id: string
  task_id: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  output: string
  exit_code: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface DebugTask {
  id: string
  agent_id: string
  command: string
  status: 'pending' | 'running' | 'success' | 'failed'
  output: string
  exit_code: number | null
  created_at: string
  updated_at: string
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
  name: string
  type: 'exec'
  config: TaskConfig
  order: number
  blocking?: boolean
}

export interface UpdateTaskRequest {
  name?: string
  type?: 'exec'
  config?: Partial<TaskConfig>
  blocking?: boolean
}

export interface ReorderTasksRequest {
  task_ids: string[]
}

export interface CreateDebugTaskRequest {
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
