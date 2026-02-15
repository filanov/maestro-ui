import { useQuery } from '@tanstack/react-query'
import { executionsApi } from '../api/maestro'

interface ExecutionsChartProps {
  clusterId: string
  clusterName: string
}

export default function ExecutionsChart({ clusterId, clusterName }: ExecutionsChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['executions', 'overview', clusterId],
    queryFn: () => executionsApi.list({ cluster_id: clusterId, limit: 100 }),
    refetchInterval: 10000,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const executions = data?.data || []
  const success = executions.filter(e => e.status === 'success').length
  const failed = executions.filter(e => e.status === 'failed').length
  const running = executions.filter(e => e.status === 'running').length
  const pending = executions.filter(e => e.status === 'pending').length
  const skipped = executions.filter(e => e.status === 'skipped').length
  const total = executions.length

  if (total === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        No executions yet
      </div>
    )
  }

  const successPercent = total > 0 ? (success / total) * 100 : 0
  const failedPercent = total > 0 ? (failed / total) * 100 : 0
  const runningPercent = total > 0 ? (running / total) * 100 : 0
  const pendingPercent = total > 0 ? (pending / total) * 100 : 0
  const skippedPercent = total > 0 ? (skipped / total) * 100 : 0

  const size = 160
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const successLength = (successPercent / 100) * circumference
  const failedLength = (failedPercent / 100) * circumference
  const runningLength = (runningPercent / 100) * circumference
  const pendingLength = (pendingPercent / 100) * circumference
  const skippedLength = (skippedPercent / 100) * circumference

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

          {success > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${successLength} ${circumference}`}
              strokeLinecap="round"
            />
          )}

          {failed > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${failedLength} ${circumference}`}
              strokeDashoffset={-successLength}
              strokeLinecap="round"
            />
          )}

          {running > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={strokeWidth}
              strokeDasharray={`${runningLength} ${circumference}`}
              strokeDashoffset={-(successLength + failedLength)}
              strokeLinecap="round"
            />
          )}

          {pending > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={`${pendingLength} ${circumference}`}
              strokeDashoffset={-(successLength + failedLength + runningLength)}
              strokeLinecap="round"
            />
          )}

          {skipped > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#6b7280"
              strokeWidth={strokeWidth}
              strokeDasharray={`${skippedLength} ${circumference}`}
              strokeDashoffset={-(successLength + failedLength + runningLength + pendingLength)}
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-500">exec{total !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="text-center">
        <div className="font-medium text-gray-700 mb-2">{clusterName}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {success > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">
                Success: <span className="font-medium text-gray-900">{success}</span>
                <span className="text-gray-400 ml-1">({successPercent.toFixed(0)}%)</span>
              </span>
            </div>
          )}
          {failed > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">
                Failed: <span className="font-medium text-gray-900">{failed}</span>
                <span className="text-gray-400 ml-1">({failedPercent.toFixed(0)}%)</span>
              </span>
            </div>
          )}
          {running > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">
                Running: <span className="font-medium text-gray-900">{running}</span>
                <span className="text-gray-400 ml-1">({runningPercent.toFixed(0)}%)</span>
              </span>
            </div>
          )}
          {pending > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-gray-600">
                Pending: <span className="font-medium text-gray-900">{pending}</span>
                <span className="text-gray-400 ml-1">({pendingPercent.toFixed(0)}%)</span>
              </span>
            </div>
          )}
          {skipped > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-gray-600">
                Skipped: <span className="font-medium text-gray-900">{skipped}</span>
                <span className="text-gray-400 ml-1">({skippedPercent.toFixed(0)}%)</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
