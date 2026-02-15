import { useQuery } from '@tanstack/react-query'
import { agentsApi } from '../api/maestro'

interface AgentStatusChartProps {
  clusterId: string
  clusterName: string
}

export default function AgentStatusChart({ clusterId, clusterName }: AgentStatusChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['agents', clusterId],
    queryFn: () => agentsApi.listByCluster(clusterId),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const agents = data?.data || []
  const active = agents.filter(a => a.status === 'active').length
  const inactive = agents.filter(a => a.status === 'inactive').length
  const total = agents.length

  if (total === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        No agents registered yet
      </div>
    )
  }

  const activePercent = total > 0 ? (active / total) * 100 : 0
  const inactivePercent = total > 0 ? (inactive / total) * 100 : 0

  const size = 160
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const activeLength = (activePercent / 100) * circumference
  const inactiveLength = (inactivePercent / 100) * circumference

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />

          {active > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${activeLength} ${circumference}`}
              strokeLinecap="round"
            />
          )}

          {inactive > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${inactiveLength} ${circumference}`}
              strokeDashoffset={-activeLength}
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-500">agent{total !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="text-center">
        <div className="font-medium text-gray-700 mb-2">{clusterName}</div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">
              Active: <span className="font-medium text-gray-900">{active}</span>
              <span className="text-gray-400 ml-1">({activePercent.toFixed(0)}%)</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">
              Inactive: <span className="font-medium text-gray-900">{inactive}</span>
              <span className="text-gray-400 ml-1">({inactivePercent.toFixed(0)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
