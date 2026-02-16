import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesApi, clustersApi } from '../api/maestro'
import type {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ImportTemplateRequest,
  ExportTemplateRequest,
} from '../types/maestro'

export function useTemplateMutations() {
  const queryClient = useQueryClient()

  const createTemplate = useMutation({
    mutationFn: (data: CreateTemplateRequest) => templatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      templatesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates', variables.id] })
    },
  })

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const importTemplate = useMutation({
    mutationFn: ({ clusterId, data }: { clusterId: string; data: ImportTemplateRequest }) =>
      clustersApi.importTemplate(clusterId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.clusterId] })
    },
  })

  const exportTemplate = useMutation({
    mutationFn: ({ clusterId, data }: { clusterId: string; data: ExportTemplateRequest }) =>
      clustersApi.exportTemplate(clusterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    importTemplate,
    exportTemplate,
  }
}
