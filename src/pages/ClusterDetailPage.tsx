import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { clustersApi, agentsApi, tasksApi } from '../api/maestro'
import { formatDistanceToNow } from 'date-fns'

export default function ClusterDetailPage() {
  const { clusterId } = useParams<{ clusterId: string }>()

  const { data: cluster } = useQuery({
    queryKey: ['clusters', clusterId],
    queryFn: () => clustersApi.get(clusterId!),
    enabled: !!clusterId,
  })

  const { data: agentsData, isLoading: loadingAgents } = useQuery({
    queryKey: ['agents', clusterId],
    queryFn: () => agentsApi.listByCluster(clusterId!),
    enabled: !!clusterId,
    refetchInterval: 30000,
  })

  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', clusterId],
    queryFn: () => tasksApi.listByCluster(clusterId!),
    enabled: !!clusterId,
  })

  if (!clusterId) {
    return <div>Invalid cluster ID</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to="/clusters" className="text-blue-600 hover:text-blue-900 text-sm">
          ← Back to Clusters
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900">{cluster?.name}</h1>
          {cluster?.description && (
            <p className="mt-2 text-sm text-gray-700">{cluster.description}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Created {cluster?.created_at ? new Date(cluster.created_at).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Agents ({agentsData?.data.length || 0})
              </h2>
              {loadingAgents ? (
                <div className="text-sm text-gray-500">Loading agents...</div>
              ) : agentsData?.data.length === 0 ? (
                <div className="text-sm text-gray-500">No agents registered yet</div>
              ) : (
                <div className="space-y-3">
                  {agentsData?.data.map((agent) => (
                    <Link
                      key={agent.id}
                      to={`/agents/${agent.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{agent.hostname}</div>
                          <div className="text-sm text-gray-500">
                            Last heartbeat: {formatDistanceToNow(new Date(agent.last_heartbeat), { addSuffix: true })}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            agent.status === 'connected'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {agent.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Tasks ({tasksData?.data.length || 0})
              </h2>
              {loadingTasks ? (
                <div className="text-sm text-gray-500">Loading tasks...</div>
              ) : tasksData?.data.length === 0 ? (
                <div className="text-sm text-gray-500">No tasks defined yet</div>
              ) : (
                <div className="space-y-2">
                  {tasksData?.data.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500">#{task.order}</span>
                            <span className="font-medium text-gray-900">{task.name}</span>
                            {task.blocking && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                                blocking
                              </span>
                            )}
                          </div>
                          <code className="mt-1 block text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {task.command}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
