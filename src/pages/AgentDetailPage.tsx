import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { agentsApi, debugTasksApi, tasksApi } from '../api/maestro'
import { formatDistanceToNow } from 'date-fns'
import type { CreateDebugTaskRequest } from '../types/maestro'

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const queryClient = useQueryClient()
  const [command, setCommand] = useState('')

  const { data: agent } = useQuery({
    queryKey: ['agents', agentId],
    queryFn: () => agentsApi.get(agentId!),
    enabled: !!agentId,
    refetchInterval: 30000,
  })

  const { data: executionsData } = useQuery({
    queryKey: ['agents', agentId, 'executions'],
    queryFn: () => agentsApi.getExecutions(agentId!),
    enabled: !!agentId,
    refetchInterval: 10000,
  })

  const { data: debugTasksData } = useQuery({
    queryKey: ['agents', agentId, 'debug-tasks'],
    queryFn: () => debugTasksApi.listByAgent(agentId!),
    enabled: !!agentId,
    refetchInterval: 5000,
  })

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', agent?.cluster_id],
    queryFn: () => tasksApi.listByCluster(agent!.cluster_id),
    enabled: !!agent?.cluster_id,
  })

  const taskNameMap = useMemo(() => {
    const map = new Map<string, string>()
    tasksData?.data.forEach((task) => {
      map.set(task.id, task.name)
    })
    return map
  }, [tasksData])

  const resetExecutionForAgentMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      tasksApi.resetExecutionForAgent(taskId, agentId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', agentId, 'executions'] })
      toast.success('Execution reset')
    },
  })

  const createDebugTaskMutation = useMutation({
    mutationFn: (data: CreateDebugTaskRequest) => debugTasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', agentId, 'debug-tasks'] })
      setCommand('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && agentId) {
      createDebugTaskMutation.mutate({
        agent_id: agentId,
        command: command.trim()
      })
    }
  }

  if (!agentId) {
    return <div>Invalid agent ID</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to={agent?.cluster_id ? `/clusters/${agent.cluster_id}` : '/clusters'}
          className="text-blue-600 hover:text-blue-900 text-sm"
        >
          ← Back to Cluster
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{agent?.hostname}</h1>
              <p className="mt-1 text-sm text-gray-500">Agent ID: {agent?.id}</p>
              <p className="mt-1 text-sm text-gray-500">
                Last heartbeat: {agent?.last_heartbeat ? formatDistanceToNow(new Date(agent.last_heartbeat), { addSuffix: true }) : 'Never'}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                agent?.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {agent?.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Debug Console</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="command" className="block text-sm font-medium text-gray-700 mb-1">
                    Run Command
                  </label>
                  <input
                    type="text"
                    id="command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="echo 'Hello from agent'"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createDebugTaskMutation.isPending || !command.trim()}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                >
                  {createDebugTaskMutation.isPending ? 'Sending...' : 'Execute'}
                </button>
                {createDebugTaskMutation.error && (
                  <div className="text-sm text-red-600">
                    Error: {createDebugTaskMutation.error.message}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Debug Tasks ({debugTasksData?.data.length || 0})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {debugTasksData?.data.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-sm font-mono text-gray-900">{task.command}</code>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          task.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : task.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    {task.output && (
                      <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                        {task.output}
                      </pre>
                    )}
                    {task.exit_code !== null && (
                      <div className="mt-2 text-xs text-gray-500">
                        Exit code: {task.exit_code}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Task Executions ({executionsData?.data.length || 0})
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {executionsData?.data.map((execution) => (
                  <div key={execution.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {taskNameMap.get(execution.task_id) || execution.task_id}
                      </div>
                      <div className="flex items-center gap-2">
                        {['success', 'failed', 'skipped'].includes(execution.status) && (
                          <button
                            onClick={() => resetExecutionForAgentMutation.mutate({ taskId: execution.task_id })}
                            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-0.5"
                          >
                            Reset
                          </button>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            execution.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : execution.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : execution.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : execution.status === 'skipped'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {execution.status}
                        </span>
                      </div>
                    </div>
                    {execution.output && (
                      <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto max-h-32">
                        {execution.output}
                      </pre>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {execution.started_at && (
                        <div>Started: {new Date(execution.started_at).toLocaleString()}</div>
                      )}
                      {execution.completed_at && (
                        <div>Completed: {new Date(execution.completed_at).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
