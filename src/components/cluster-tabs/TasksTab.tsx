import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '../../api/maestro'

interface TasksTabProps {
  clusterId: string
}

export default function TasksTab({ clusterId }: TasksTabProps) {
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', clusterId],
    queryFn: () => tasksApi.listByCluster(clusterId),
  })

  const tasks = tasksData?.data || []

  return (
    <div className="space-y-4">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Tasks ({tasks.length})
            </h2>
            <button
              disabled
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Task creation coming soon"
            >
              Create Task
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No tasks defined yet
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
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
                    <div className="relative ml-4">
                      <button
                        disabled
                        className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                        title="Task actions coming soon"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Coming soon:</strong> Task management features including create, edit, delete, reorder (drag-and-drop), and toggle blocking flag.
        </p>
      </div>
    </div>
  )
}
