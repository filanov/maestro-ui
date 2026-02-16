import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
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
import { templatesApi, templateTasksApi } from '../api/maestro'
import { useTemplateTaskMutations } from '../hooks/useTemplateTaskMutations'
import TaskFormModal from '../components/TaskFormModal'
import type { TemplateTask, CreateTemplateTaskRequest, UpdateTemplateTaskRequest } from '../types/maestro'
import type { TaskFormData } from '../schemas/taskSchema'

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    task?: TemplateTask
  }>({ isOpen: false, mode: 'create' })

  const { data: template } = useQuery({
    queryKey: ['templates', templateId],
    queryFn: () => templatesApi.get(templateId!),
    enabled: !!templateId,
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['template-tasks', templateId],
    queryFn: () => templateTasksApi.listByTemplate(templateId!),
    enabled: !!templateId,
  })

  const { createTask, updateTask, deleteTask, reorderTasks } = useTemplateTaskMutations(
    templateId!
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tasks = tasksData?.data || []

  const handleModalSubmit = (data: TaskFormData) => {
    if (modalState.mode === 'create') {
      const request: CreateTemplateTaskRequest = {
        name: data.name,
        type: 'exec',
        config: {
          command: data.command,
          timeout_seconds: data.timeout_seconds,
        },
        blocking: data.blocking,
      }
      createTask.mutate(request, {
        onSuccess: () => setModalState({ isOpen: false, mode: 'create' }),
      })
    } else if (modalState.task) {
      const request: UpdateTemplateTaskRequest = {
        name: data.name,
        config: {
          command: data.command,
          timeout_seconds: data.timeout_seconds,
        },
        blocking: data.blocking,
      }
      updateTask.mutate(
        { id: modalState.task.id, data: request },
        {
          onSuccess: () => setModalState({ isOpen: false, mode: 'create' }),
        }
      )
    }
  }

  const handleEdit = (task: TemplateTask) => {
    setModalState({ isOpen: true, mode: 'edit', task })
  }

  const handleDelete = (task: TemplateTask) => {
    if (
      confirm(
        `Are you sure you want to delete '${task.name}'? This action cannot be undone.`
      )
    ) {
      deleteTask.mutate(task.id)
    }
  }

  const handleBlockingToggle = (task: TemplateTask) => {
    updateTask.mutate({
      id: task.id,
      data: { blocking: !task.blocking },
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
      const taskIds = reorderedTasks.map((t) => t.id)

      reorderTasks.mutate(taskIds)
    }
  }

  if (!templateId) {
    return <div>Invalid template ID</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to="/templates" className="text-blue-600 hover:text-blue-900 text-sm">
          ← Back to Templates
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{template?.name}</h1>
              {template?.description && (
                <p className="mt-2 text-sm text-gray-500">{template.description}</p>
              )}
              <div className="mt-4 text-sm text-gray-500">
                <p>Created: {template?.created_at ? new Date(template.created_at).toLocaleString() : '-'}</p>
                <p>Updated: {template?.updated_at ? new Date(template.updated_at).toLocaleString() : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Tasks ({tasks.length})</h2>
            <button
              onClick={() => setModalState({ isOpen: true, mode: 'create' })}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Create Task
            </button>
          </div>

          {tasksLoading ? (
            <div className="text-center py-8 text-sm text-gray-500">Loading tasks...</div>
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
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      onEdit={() => handleEdit(task)}
                      onDelete={() => handleDelete(task)}
                      onBlockingToggle={() => handleBlockingToggle(task)}
                      isUpdating={updateTask.isPending}
                      showDragHandle={tasks.length > 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <TaskFormModal
        mode={modalState.mode}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        onSubmit={handleModalSubmit}
        initialData={
          modalState.task
            ? {
                name: modalState.task.name,
                command: modalState.task.config.command,
                timeout_seconds: modalState.task.config.timeout_seconds || 300,
                blocking: modalState.task.blocking,
              }
            : undefined
        }
        isLoading={createTask.isPending || updateTask.isPending}
        error={createTask.error || updateTask.error}
      />
    </div>
  )
}

interface SortableTaskItemProps {
  task: TemplateTask
  onEdit: () => void
  onDelete: () => void
  onBlockingToggle: () => void
  isUpdating: boolean
  showDragHandle: boolean
}

function SortableTaskItem({
  task,
  onEdit,
  onDelete,
  onBlockingToggle,
  isUpdating,
  showDragHandle
}: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onBlockingToggle={onBlockingToggle}
        isUpdating={isUpdating}
        showDragHandle={showDragHandle}
        dragHandleProps={showDragHandle ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  )
}

interface TaskCardProps {
  task: TemplateTask
  onEdit: () => void
  onDelete: () => void
  onBlockingToggle: () => void
  isUpdating: boolean
  showDragHandle: boolean
  dragHandleProps?: any
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onBlockingToggle,
  isUpdating,
  showDragHandle,
  dragHandleProps,
}: TaskCardProps) {
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
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {showDragHandle && (
          <button
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-1"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
            </svg>
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500">#{task.order}</span>
                <h3 className="text-sm font-medium text-gray-900">{task.name}</h3>
                {task.blocking && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                    Blocking
                  </span>
                )}
              </div>
              <code className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded block break-all">
                {task.config.command}
              </code>
              {task.config.timeout_seconds && (
                <p className="mt-2 text-xs text-gray-500">
                  Timeout: {task.config.timeout_seconds}s
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={task.blocking}
                  onChange={onBlockingToggle}
                  disabled={isUpdating}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Blocking
              </label>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onEdit()
                          setMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete()
                          setMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
