import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '../api/maestro'

interface TasksChartProps {
  clusterId: string
  clusterName: string
}

export default function TasksChart({ clusterId, clusterName }: TasksChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks', clusterId],
    queryFn: () => tasksApi.listByCluster(clusterId),
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const tasks = data?.data || []
  const blocking = tasks.filter(t => t.blocking).length
  const nonBlocking = tasks.filter(t => !t.blocking).length
  const total = tasks.length

  if (total === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        No tasks defined yet
      </div>
    )
  }

  const blockingPercent = total > 0 ? (blocking / total) * 100 : 0
  const nonBlockingPercent = total > 0 ? (nonBlocking / total) * 100 : 0

  const size = 160
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const blockingLength = (blockingPercent / 100) * circumference
  const nonBlockingLength = (nonBlockingPercent / 100) * circumference

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

          {nonBlocking > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={strokeWidth}
              strokeDasharray={`${nonBlockingLength} ${circumference}`}
              strokeLinecap="round"
            />
          )}

          {blocking > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={`${blockingLength} ${circumference}`}
              strokeDashoffset={-nonBlockingLength}
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-500">task{total !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="text-center">
        <div className="font-medium text-gray-700 mb-2">{clusterName}</div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">
              Non-blocking: <span className="font-medium text-gray-900">{nonBlocking}</span>
              <span className="text-gray-400 ml-1">({nonBlockingPercent.toFixed(0)}%)</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-600">
              Blocking: <span className="font-medium text-gray-900">{blocking}</span>
              <span className="text-gray-400 ml-1">({blockingPercent.toFixed(0)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
