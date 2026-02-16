import { useState, useEffect } from 'react'
import type { Task } from '../types/maestro'

interface ExportTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (data: { name: string; description?: string; taskIds?: string[] }) => void
  tasks: Task[]
  isLoading?: boolean
  error?: Error | null
}

export default function ExportTemplateModal({
  isOpen,
  onClose,
  onExport,
  tasks,
  isLoading = false,
  error,
}: ExportTemplateModalProps) {
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTemplateName('')
      setTemplateDescription('')
      setSelectedTaskIds(new Set())
      setValidationError('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!templateName.trim()) {
      setValidationError('Template name is required')
      return
    }

    if (selectedTaskIds.size === 0) {
      setValidationError('Please select at least one task to export')
      return
    }

    const exportData = {
      template_name: templateName.trim(),
      template_description: templateDescription.trim() || undefined,
      task_ids: selectedTaskIds.size === tasks.length ? undefined : Array.from(selectedTaskIds),
    }

    onExport(exportData)
  }

  const handleClose = () => {
    setTemplateName('')
    setTemplateDescription('')
    setSelectedTaskIds(new Set())
    setValidationError('')
    onClose()
  }

  const handleToggleTask = (taskId: string) => {
    const newSelected = new Set(selectedTaskIds)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTaskIds(newSelected)
  }

  const handleSelectAll = () => {
    setSelectedTaskIds(new Set(tasks.map((t) => t.id)))
  }

  const handleDeselectAll = () => {
    setSelectedTaskIds(new Set())
  }

  if (!isOpen) return null

  const allSelected = selectedTaskIds.size === tasks.length && tasks.length > 0

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Export as Template</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error?.message || validationError}
              </div>
            )}

            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Production Deployment"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="template-description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="template-description"
                rows={3}
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is used for..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Tasks <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={isLoading || allSelected}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    disabled={isLoading || selectedTaskIds.size === 0}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No tasks available to export. Create some tasks first.
                </div>
              ) : (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {tasks.map((task) => (
                    <label
                      key={task.id}
                      className={`flex items-start p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedTaskIds.has(task.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => handleToggleTask(task.id)}
                        disabled={isLoading}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-500">#{task.order}</span>
                          <span className="text-sm font-medium text-gray-900">{task.name}</span>
                          {task.blocking && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                              blocking
                            </span>
                          )}
                        </div>
                        <code className="mt-1 block text-xs text-gray-600 break-all">
                          {task.config.command}
                        </code>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Selected: {selectedTaskIds.size} of {tasks.length} tasks
                {selectedTaskIds.size === tasks.length && tasks.length > 0 && (
                  <span className="ml-1 text-blue-600">(all tasks)</span>
                )}
              </p>
            </div>

            {selectedTaskIds.size > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Export Preview</h3>
                <p className="text-sm text-blue-700">
                  {selectedTaskIds.size === tasks.length
                    ? 'All tasks will be exported to the new template.'
                    : `${selectedTaskIds.size} selected tasks will be exported to the new template.`}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Tasks will maintain their order, configuration, and blocking settings.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || tasks.length === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Exporting...' : 'Export Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
