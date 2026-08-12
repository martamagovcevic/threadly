import { z } from 'zod'

export const ModerateItemSchema = z.object({ hidden: z.boolean() })
export type ModerateItemInput = z.infer<typeof ModerateItemSchema>
