import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/maestro'
import type { CreateTaskRequest, UpdateTaskRequest, ReorderTasksRequest } from '../types/maestro'

export function useTaskMutations(clusterId: string) {
  const queryClient = useQueryClient()

  const createTask = useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(clusterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', clusterId] })
    },
  })

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', clusterId] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', clusterId] })
    },
  })

  const reorderTasks = useMutation({
    mutationFn: (data: ReorderTasksRequest) =>
      tasksApi.reorder(clusterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', clusterId] })
    },
  })

  return { createTask, updateTask, deleteTask, reorderTasks }
}
