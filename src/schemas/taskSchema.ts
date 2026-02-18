import { z } from 'zod'

export const taskFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .transform(val => val.trim()),
  type: z.enum(['exec', 'bash']).default('bash'),
  command: z.string()
    .min(1, 'Command is required')
    .max(1000, 'Command must be 1000 characters or less')
    .transform(val => val.trim()),
  timeout_seconds: z.number()
    .min(1, 'Timeout must be at least 1 second')
    .default(300),
  blocking: z.boolean().default(false),
  schedule_enabled: z.boolean().default(false),
  schedule_interval: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.schedule_enabled && (!data.schedule_interval || data.schedule_interval.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Interval is required when scheduling is enabled (e.g. "5m", "1h", "30s")',
      path: ['schedule_interval'],
    })
  }
})

export type TaskFormData = z.infer<typeof taskFormSchema>
