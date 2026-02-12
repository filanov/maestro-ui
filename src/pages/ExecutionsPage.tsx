import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { executionsApi } from '../api/maestro'
import type { ExecutionFilters, TaskExecution } from '../types/maestro'

export default function ExecutionsPage() {
  const [filters, setFilters] = useState<ExecutionFilters>({
    limit: 50,
    offset: 0,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['executions', filters],
    queryFn: () => executionsApi.list(filters),
    refetchInterval: 10000,
  })

  const updateFilter = (key: keyof ExecutionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      offset: 0,
    }))
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Task Executions</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and filter task execution history across all agents
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white shadow sm:rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value as TaskExecution['status'])}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
          <div>
            <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700 mb-1">
              Agent ID
            </label>
            <input
              type="text"
              id="agent_id"
              value={filters.agent_id || ''}
              onChange={(e) => updateFilter('agent_id', e.target.value)}
              placeholder="Filter by agent"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="task_id" className="block text-sm font-medium text-gray-700 mb-1">
              Task ID
            </label>
            <input
              type="text"
              id="task_id"
              value={filters.task_id || ''}
              onChange={(e) => updateFilter('task_id', e.target.value)}
              placeholder="Filter by task"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="cluster_id" className="block text-sm font-medium text-gray-700 mb-1">
              Cluster ID
            </label>
            <input
              type="text"
              id="cluster_id"
              value={filters.cluster_id || ''}
              onChange={(e) => updateFilter('cluster_id', e.target.value)}
              placeholder="Filter by cluster"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flow-root">
        {isLoading ? (
          <div className="text-center py-8">Loading executions...</div>
        ) : (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Agent ID
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Task ID
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Started
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Completed
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Exit Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data?.data.map((execution) => (
                      <tr key={execution.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-gray-900 sm:pl-6">
                          {execution.agent_id.substring(0, 8)}...
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-500">
                          {execution.task_id.substring(0, 8)}...
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {execution.started_at
                            ? new Date(execution.started_at).toLocaleString()
                            : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {execution.completed_at
                            ? new Date(execution.completed_at).toLocaleString()
                            : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {execution.exit_code ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {data && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {data.offset + 1} to {Math.min(data.offset + data.limit, data.total)} of {data.total} executions
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, offset: Math.max(0, prev.offset! - prev.limit!) }))}
              disabled={filters.offset === 0}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, offset: prev.offset! + prev.limit! }))}
              disabled={data.offset + data.limit >= data.total}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
