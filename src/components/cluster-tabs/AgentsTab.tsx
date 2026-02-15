import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { agentsApi } from '../../api/maestro'
import { formatDistanceToNow } from 'date-fns'

interface AgentsTabProps {
  clusterId: string
}

export default function AgentsTab({ clusterId }: AgentsTabProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(0)
  const limit = 50

  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents', clusterId],
    queryFn: () => agentsApi.listByCluster(clusterId),
    refetchInterval: 30000,
  })

  const filteredAgents = useMemo(() => {
    let agents = agentsData?.data || []

    if (statusFilter !== 'all') {
      agents = agents.filter((a) => a.status === statusFilter)
    }

    if (search) {
      agents = agents.filter((a) =>
        a.hostname.toLowerCase().includes(search.toLowerCase())
      )
    }

    return agents
  }, [agentsData?.data, statusFilter, search])

  const totalPages = Math.ceil(filteredAgents.length / limit)
  const paginatedAgents = filteredAgents.slice(page * limit, (page + 1) * limit)
  const startIndex = page * limit + 1
  const endIndex = Math.min((page + 1) * limit, filteredAgents.length)

  return (
    <div className="space-y-4">
      <div className="bg-white shadow sm:rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by hostname
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              placeholder="Filter agents..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
                setPage(0)
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Agents ({filteredAgents.length})
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedAgents.length === 0 ? (
            <div className="text-sm text-gray-500">
              {search || statusFilter !== 'all' ? 'No agents match your filters' : 'No agents registered yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedAgents.map((agent) => (
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
                        agent.status === 'active'
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

      {filteredAgents.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 shadow sm:rounded-lg">
          <div className="text-sm text-gray-700">
            Showing {startIndex} to {endIndex} of {filteredAgents.length} agents
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
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
