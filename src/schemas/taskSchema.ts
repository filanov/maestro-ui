import { z } from 'zod'

export const taskFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .transform(val => val.trim()),
  command: z.string()
    .min(1, 'Command is required')
    .max(1000, 'Command must be 1000 characters or less')
    .transform(val => val.trim()),
  timeout_seconds: z.number()
    .positive('Timeout must be positive')
    .default(300),
  blocking: z.boolean().default(false),
})

export type TaskFormData = z.infer<typeof taskFormSchema>
