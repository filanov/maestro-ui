import AgentStatusChart from '../AgentStatusChart'
import TasksChart from '../TasksChart'
import ExecutionsChart from '../ExecutionsChart'

interface OverviewTabProps {
  clusterId: string
  clusterName: string
}

export default function OverviewTab({ clusterId, clusterName }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Agent Status</h2>
            <AgentStatusChart clusterId={clusterId} clusterName={clusterName} />
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Task Breakdown</h2>
            <TasksChart clusterId={clusterId} clusterName={clusterName} />
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Execution Status</h2>
            <ExecutionsChart clusterId={clusterId} clusterName={clusterName} />
          </div>
        </div>
      </div>
    </div>
  )
}
