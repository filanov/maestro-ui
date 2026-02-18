import { useState, useEffect } from 'react'
import { taskFormSchema, type TaskFormData } from '../schemas/taskSchema'
import type { ZodError } from 'zod'

interface TaskFormModalProps {
  mode: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => void
  initialData?: Partial<TaskFormData>
  isLoading?: boolean
  error?: Error | null
}

export default function TaskFormModal({
  mode,
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  error = null,
}: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'bash',
    command: initialData?.command || '',
    timeout_seconds: initialData?.timeout_seconds ?? 300,
    blocking: initialData?.blocking || false,
    schedule_enabled: initialData?.schedule_enabled || false,
    schedule_interval: initialData?.schedule_interval || '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    try {
      const validated = taskFormSchema.parse(formData)
      onSubmit(validated)
    } catch (err) {
      if (err instanceof Error && 'errors' in err) {
        const zodError = err as ZodError
        const errors: Record<string, string> = {}
        zodError.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message
          }
        })
        setValidationErrors(errors)
      }
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {mode === 'create' ? 'Create Task' : 'Edit Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isLoading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">Error: {error.message}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                autoFocus
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border disabled:opacity-50"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="bash"
                    checked={formData.type === 'bash'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'exec' | 'bash' })}
                    disabled={isLoading}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Bash <span className="text-xs text-gray-500">(shell script)</span>
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="exec"
                    checked={formData.type === 'exec'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'exec' | 'bash' })}
                    disabled={isLoading}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Exec <span className="text-xs text-gray-500">(direct execution)</span>
                  </span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Bash executes commands in a shell environment with access to shell features. Exec runs commands directly.
              </p>
              {validationErrors.type && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
              )}
            </div>

            <div>
              <label htmlFor="command" className="block text-sm font-medium text-gray-700">
                Command
              </label>
              <textarea
                id="command"
                rows={4}
                value={formData.command}
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border font-mono text-xs disabled:opacity-50"
              />
              {validationErrors.command && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.command}</p>
              )}
            </div>

            <div>
              <label htmlFor="timeout_seconds" className="block text-sm font-medium text-gray-700">
                Timeout (seconds)
              </label>
              <input
                type="number"
                id="timeout_seconds"
                min="1"
                value={formData.timeout_seconds}
                onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) || 0 })}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border disabled:opacity-50"
              />
              {validationErrors.timeout_seconds && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.timeout_seconds}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="blocking"
                checked={formData.blocking}
                onChange={(e) => setFormData({ ...formData, blocking: e.target.checked })}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="blocking" className="ml-2 block text-sm text-gray-700">
                Blocking (failure skips subsequent tasks)
              </label>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="schedule_enabled"
                  checked={formData.schedule_enabled}
                  onChange={(e) => setFormData({ ...formData, schedule_enabled: e.target.checked })}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor="schedule_enabled" className="ml-2 block text-sm text-gray-700">
                  Enable periodic scheduling
                </label>
              </div>

              {formData.schedule_enabled && (
                <div className="mt-3">
                  <label htmlFor="schedule_interval" className="block text-sm font-medium text-gray-700">
                    Interval
                  </label>
                  <input
                    type="text"
                    id="schedule_interval"
                    value={formData.schedule_interval || ''}
                    onChange={(e) => setFormData({ ...formData, schedule_interval: e.target.value })}
                    disabled={isLoading}
                    placeholder="e.g. 5m, 1h, 30s"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Go duration format: s (seconds), m (minutes), h (hours). Example: 5m, 1h30m, 30s
                  </p>
                  {validationErrors.schedule_interval && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.schedule_interval}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
