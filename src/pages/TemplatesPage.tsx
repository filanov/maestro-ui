import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { templatesApi } from '../api/maestro'
import { useTemplateMutations } from '../hooks/useTemplateMutations'
import ConfirmDialog from '../components/ConfirmDialog'
import type { CreateTemplateRequest, Template } from '../types/maestro'

export default function TemplatesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: '',
    description: '',
  })

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; template: Template | null }>({
    open: false,
    template: null,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
  })

  const { createTemplate, updateTemplate, deleteTemplate } = useTemplateMutations()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, data: formData },
        {
          onSuccess: () => {
            setEditingTemplate(null)
            setFormData({ name: '', description: '' })
          },
        }
      )
    } else {
      createTemplate.mutate(formData, {
        onSuccess: () => {
          setIsCreating(false)
          setFormData({ name: '', description: '' })
        },
      })
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
    })
    setMenuOpenId(null)
  }

  const handleDelete = (template: Template) => {
    setDeleteConfirm({ open: true, template })
    setMenuOpenId(null)
  }

  const confirmDelete = () => {
    if (deleteConfirm.template) {
      deleteTemplate.mutate(deleteConfirm.template.id)
      setDeleteConfirm({ open: false, template: null })
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingTemplate(null)
    setFormData({ name: '', description: '' })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading templates: {error.message}
      </div>
    )
  }

  const showForm = isCreating || editingTemplate

  return (
    <>
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Template?"
        message={`Are you sure you want to delete '${deleteConfirm.template?.name}'? This action cannot be undone.`}
        confirmLabel="Delete Template"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, template: null })}
      />

      <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage task templates for quick cluster setup
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsCreating(true)}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Create Template
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createTemplate.isPending || updateTemplate.isPending}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
              >
                {createTemplate.isPending || updateTemplate.isPending
                  ? 'Saving...'
                  : editingTemplate
                  ? 'Update'
                  : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            {(createTemplate.error || updateTemplate.error) && (
              <div className="text-sm text-red-600">
                Error: {(createTemplate.error || updateTemplate.error)?.message}
              </div>
            )}
          </form>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.data.map((template) => (
                    <tr key={template.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link
                          to={`/templates/${template.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {template.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {template.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(template.created_at).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <TemplateMenu
                          template={template}
                          isOpen={menuOpenId === template.id}
                          onToggle={() =>
                            setMenuOpenId(menuOpenId === template.id ? null : template.id)
                          }
                          onClose={() => setMenuOpenId(null)}
                          onEdit={() => handleEdit(template)}
                          onDelete={() => handleDelete(template)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

interface TemplateMenuProps {
  template: Template
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

function TemplateMenu({
  template,
  isOpen,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}: TemplateMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 160,
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="text-gray-400 hover:text-gray-600"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            <div className="py-1">
              <Link
                to={`/templates/${template.id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                View Details
              </Link>
              <button
                onClick={onEdit}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
