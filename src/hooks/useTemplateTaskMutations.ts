import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templateTasksApi } from '../api/maestro'
import type {
  CreateTemplateTaskRequest,
  UpdateTemplateTaskRequest,
} from '../types/maestro'

export function useTemplateTaskMutations(templateId: string) {
  const queryClient = useQueryClient()

  const createTask = useMutation({
    mutationFn: (data: CreateTemplateTaskRequest) =>
      templateTasksApi.create(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-tasks', templateId] })
    },
  })

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateTaskRequest }) =>
      templateTasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-tasks', templateId] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => templateTasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-tasks', templateId] })
    },
  })

  const reorderTasks = useMutation({
    mutationFn: (taskIds: string[]) =>
      templateTasksApi.reorder(templateId, {
        template_id: templateId,
        task_ids: taskIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-tasks', templateId] })
    },
  })

  return {
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  }
}
