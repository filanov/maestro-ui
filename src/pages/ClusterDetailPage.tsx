import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { clustersApi } from '../api/maestro'
import OverviewTab from '../components/cluster-tabs/OverviewTab'
import AgentsTab from '../components/cluster-tabs/AgentsTab'
import TasksTab from '../components/cluster-tabs/TasksTab'
import ExecutionsTab from '../components/cluster-tabs/ExecutionsTab'

type TabType = 'overview' | 'agents' | 'tasks' | 'executions'

export default function ClusterDetailPage() {
  const { clusterId } = useParams<{ clusterId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = (searchParams.get('tab') || 'overview') as TabType

  const { data: cluster } = useQuery({
    queryKey: ['clusters', clusterId],
    queryFn: () => clustersApi.get(clusterId!),
    enabled: !!clusterId,
  })

  if (!clusterId) {
    return <div>Invalid cluster ID</div>
  }

  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab })
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'Agents' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'executions', label: 'Executions' },
  ]

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

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'overview' && (
          <OverviewTab clusterId={clusterId} clusterName={cluster?.name || 'Cluster'} />
        )}
        {activeTab === 'agents' && <AgentsTab clusterId={clusterId} />}
        {activeTab === 'tasks' && <TasksTab clusterId={clusterId} />}
        {activeTab === 'executions' && <ExecutionsTab clusterId={clusterId} />}
      </div>
    </div>
  )
}
