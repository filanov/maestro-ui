import { useQuery } from '@tanstack/react-query'
import { agentsApi, tasksApi, executionsApi } from '../../api/maestro'
import AgentStatusChart from '../AgentStatusChart'

interface OverviewTabProps {
  clusterId: string
  clusterName: string
}

export default function OverviewTab({ clusterId, clusterName }: OverviewTabProps) {
  const { data: agentsData, isLoading: loadingAgents } = useQuery({
    queryKey: ['agents', clusterId],
    queryFn: () => agentsApi.listByCluster(clusterId),
    refetchInterval: 30000,
  })

  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', clusterId],
    queryFn: () => tasksApi.listByCluster(clusterId),
  })

  const { data: executionsData, isLoading: loadingExecutions } = useQuery({
    queryKey: ['executions', 'overview', clusterId],
    queryFn: () => executionsApi.list({ cluster_id: clusterId, limit: 100 }),
    refetchInterval: 10000,
  })

  const agents = agentsData?.data || []
  const activeAgents = agents.filter((a) => a.status === 'active').length
  const inactiveAgents = agents.filter((a) => a.status === 'inactive').length

  const tasks = tasksData?.data || []
  const blockingTasks = tasks.filter((t) => t.blocking).length

  const executions = executionsData?.data || []
  const successfulExecutions = executions.filter((e) => e.status === 'success').length
  const successRate = executions.length > 0 ? Math.round((successfulExecutions / executions.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Agent Status</h2>
          <AgentStatusChart clusterId={clusterId} clusterName={clusterName} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Agents</h3>
            {loadingAgents ? (
              <div className="mt-2 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{agents.length}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {activeAgents} active, {inactiveAgents} inactive
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            {loadingTasks ? (
              <div className="mt-2 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{tasks.length}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {blockingTasks} blocking
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-sm font-medium text-gray-500">Recent Executions</h3>
            {loadingExecutions ? (
              <div className="mt-2 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{executions.length}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {successRate}% success rate
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
