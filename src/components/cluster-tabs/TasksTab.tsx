import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { tasksApi } from '../../api/maestro'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { useTemplateMutations } from '../../hooks/useTemplateMutations'
import TaskFormModal from '../TaskFormModal'
import ImportTemplateModal from '../ImportTemplateModal'
import ExportTemplateModal from '../ExportTemplateModal'
import ConfirmDialog from '../ConfirmDialog'
import type { Task } from '../../types/maestro'
import type { TaskFormData } from '../../schemas/taskSchema'

interface TasksTabProps {
  clusterId: string
}

export default function TasksTab({ clusterId }: TasksTabProps) {
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', clusterId],
    queryFn: () => tasksApi.listByCluster(clusterId),
  })

  const tasks = tasksData?.data || []
  const { createTask, updateTask, deleteTask, reorderTasks } = useTaskMutations(clusterId)
  const { importTemplate, exportTemplate } = useTemplateMutations()

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    task?: Task
  }>({ isOpen: false, mode: 'create' })

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  })

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleCreateTask = () => {
    setModalState({ isOpen: true, mode: 'create' })
  }

  const handleEditTask = (task: Task) => {
    setModalState({ isOpen: true, mode: 'edit', task })
  }

  const handleDeleteTask = (task: Task) => {
    setDeleteConfirm({ open: true, task })
  }

  const confirmDelete = () => {
    if (deleteConfirm.task) {
      deleteTask.mutate(deleteConfirm.task.id)
      setDeleteConfirm({ open: false, task: null })
    }
  }

  const handleToggleBlocking = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      data: { blocking: !task.blocking },
    })
  }

  const handleEnterSelectionMode = () => {
    setSelectionMode(true)
    setSelectedTaskIds(new Set())
  }

  const handleExitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedTaskIds(new Set())
  }

  const handleToggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTaskIds)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTaskIds(newSelected)
  }

  const handleSelectAll = () => {
    setSelectedTaskIds(new Set(tasks.map(t => t.id)))
  }

  const handleDeselectAll = () => {
    setSelectedTaskIds(new Set())
  }

  const handleBulkDelete = () => {
    setBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = () => {
    selectedTaskIds.forEach(taskId => {
      deleteTask.mutate(taskId)
    })
    setBulkDeleteConfirm(false)
    handleExitSelectionMode()
  }

  const handleModalSubmit = (data: TaskFormData) => {
    if (modalState.mode === 'create') {
      createTask.mutate(
        {
          cluster_id: clusterId,
          name: data.name,
          type: data.type,
          config: {
            command: data.command,
            timeout_seconds: data.timeout_seconds,
          },
          blocking: data.blocking,
        },
        {
          onSuccess: () => {
            setModalState({ isOpen: false, mode: 'create' })
          },
        }
      )
    } else if (modalState.task) {
      updateTask.mutate(
        {
          id: modalState.task.id,
          data: {
            name: data.name,
            type: data.type,
            config: {
              command: data.command,
              timeout_seconds: data.timeout_seconds,
            },
            blocking: data.blocking,
          },
        },
        {
          onSuccess: () => {
            setModalState({ isOpen: false, mode: 'create' })
          },
        }
      )
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
      const taskIds = reorderedTasks.map((t) => t.id)

      reorderTasks.mutate({ cluster_id: clusterId, task_ids: taskIds })
    }
  }

  const handleImport = (templateId: string) => {
    importTemplate.mutate(
      { clusterId, data: { template_id: templateId } },
      {
        onSuccess: (response) => {
          setIsImportModalOpen(false)
          toast.success(`Successfully imported ${response.tasks_imported} tasks from template`)
        },
      }
    )
  }

  const handleExport = (data: { template_name: string; template_description?: string; task_ids?: string[] }) => {
    exportTemplate.mutate(
      { clusterId, data },
      {
        onSuccess: (template) => {
          setIsExportModalOpen(false)
          toast.success(`Successfully exported ${data.task_ids?.length || tasks.length} tasks to template "${template.name}"`)
        },
      }
    )
  }

  return (
    <>
      <TaskFormModal
        mode={modalState.mode}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        onSubmit={handleModalSubmit}
        initialData={modalState.task ? {
          name: modalState.task.name,
          type: modalState.task.type,
          command: modalState.task.config.command,
          timeout_seconds: modalState.task.config.timeout_seconds,
          blocking: modalState.task.blocking,
        } : undefined}
        isLoading={modalState.mode === 'create' ? createTask.isPending : updateTask.isPending}
        error={modalState.mode === 'create' ? createTask.error : updateTask.error}
      />

      <ImportTemplateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        isLoading={importTemplate.isPending}
        error={importTemplate.error}
      />

      <ExportTemplateModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        tasks={tasks}
        isLoading={exportTemplate.isPending}
        error={exportTemplate.error}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Task?"
        message={`Are you sure you want to delete '${deleteConfirm.task?.name}'? This action cannot be undone.`}
        confirmLabel="Delete Task"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, task: null })}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title="Delete Multiple Tasks?"
        message={`Are you sure you want to delete ${selectedTaskIds.size} task${selectedTaskIds.size === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmLabel="Delete Tasks"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />

      <div className="space-y-4">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Tasks ({tasks.length})
              </h2>
              <div className="flex gap-2">
                {selectionMode ? (
                  <button
                    onClick={handleExitSelectionMode}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Import from Template
                    </button>
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      disabled={tasks.length === 0}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Export as Template
                    </button>
                    <button
                      onClick={handleCreateTask}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                      Create Task
                    </button>
                    <button
                      onClick={handleEnterSelectionMode}
                      disabled={tasks.length === 0}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Select Tasks
                    </button>
                  </>
                )}
              </div>
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
              No tasks defined yet. Create your first task to get started.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      showDragHandle={tasks.length > 1 && !selectionMode}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onToggleBlocking={handleToggleBlocking}
                      isUpdating={updateTask.isPending && updateTask.variables?.id === task.id}
                      selectionMode={selectionMode}
                      isSelected={selectedTaskIds.has(task.id)}
                      onToggleSelection={handleToggleTaskSelection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>

      {selectionMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">
                  {selectedTaskIds.size} task{selectedTaskIds.size === 1 ? '' : 's'} selected
                </span>
                {selectedTaskIds.size === tasks.length ? (
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Deselect All
                  </button>
                ) : (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Select All
                  </button>
                )}
              </div>
              <button
                onClick={handleBulkDelete}
                disabled={selectedTaskIds.size === 0}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface SortableTaskItemProps {
  task: Task
  showDragHandle: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onToggleBlocking: (task: Task) => void
  isUpdating: boolean
  selectionMode: boolean
  isSelected: boolean
  onToggleSelection: (taskId: string) => void
}

function SortableTaskItem({
  task,
  showDragHandle,
  onEdit,
  onDelete,
  onToggleBlocking,
  isUpdating,
  selectionMode,
  isSelected,
  onToggleSelection,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`p-3 border rounded-lg ${selectionMode && isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
        <div className="flex items-start gap-2">
          {selectionMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(task.id)}
              className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          )}

          {showDragHandle && !selectionMode && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
              title="Drag to reorder"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="7" cy="5" r="1.5" />
                <circle cx="13" cy="5" r="1.5" />
                <circle cx="7" cy="10" r="1.5" />
                <circle cx="13" cy="10" r="1.5" />
                <circle cx="7" cy="15" r="1.5" />
                <circle cx="13" cy="15" r="1.5" />
              </svg>
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-gray-500">#{task.order}</span>
              <span className="font-medium text-gray-900">{task.name}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                task.type === 'bash' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {task.type}
              </span>
              {task.blocking && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                  blocking
                </span>
              )}
            </div>
            <code className="mt-1 block text-xs text-gray-600 bg-gray-50 p-2 rounded break-all">
              {task.config.command}
            </code>
            <div className="mt-1 text-xs text-gray-500">
              Timeout: {task.config.timeout_seconds}s
            </div>
            {!selectionMode && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.blocking}
                  onChange={() => onToggleBlocking(task)}
                  disabled={isUpdating}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  id={`blocking-${task.id}`}
                />
                <label htmlFor={`blocking-${task.id}`} className="text-xs text-gray-600">
                  Blocking task
                  {isUpdating && <span className="ml-1">(updating...)</span>}
                </label>
              </div>
            )}
          </div>

          {!selectionMode && (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(task)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(task)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
