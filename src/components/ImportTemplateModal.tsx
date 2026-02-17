import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { templatesApi } from '../api/maestro'

interface ImportTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (templateId: string) => void
  isLoading?: boolean
  error?: Error | null
}

export default function ImportTemplateModal({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
  error,
}: ImportTemplateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(100, 0),
    enabled: isOpen,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTemplateId) {
      onImport(selectedTemplateId)
    }
  }

  const handleClose = () => {
    setSelectedTemplateId('')
    onClose()
  }

  if (!isOpen) return null

  const templates = templatesData?.data || []
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Import from Template</h2>
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
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error.message}
              </div>
            )}

            {templatesLoading ? (
              <div className="text-center py-8 text-sm text-gray-500">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No templates available. Create a template first to import tasks.
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Select a template to import its tasks into this cluster. This will add all
                  tasks from the template while preserving existing tasks.
                </p>

                <div className="space-y-3">
                  {templates.map((template) => (
                    <label
                      key={template.id}
                      className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTemplateId === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={selectedTemplateId === template.id}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {template.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(template.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {template.description && (
                            <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                      Preview: {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {selectedTemplate.description || 'No description'}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Tasks from this template will be added to the cluster with their original
                      order and configuration.
                    </p>
                  </div>
                )}
              </>
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
              disabled={!selectedTemplateId || isLoading || templates.length === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Importing...' : 'Import Tasks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
