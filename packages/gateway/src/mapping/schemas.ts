import { z } from "zod"

export const ChatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant", "tool"]),
      content: z
        .string()
        .nullable()
        .or(z.array(z.record(z.unknown())))
        .optional()
        .default(""),
      tool_call_id: z.string().optional(),
      tool_calls: z
        .array(
          z.object({
            id: z.string(),
            type: z.literal("function"),
            function: z.object({
              name: z.string(),
              arguments: z.string(),
            }),
          })
        )
        .optional(),
    })
  ),
  stream: z.boolean().optional().default(false),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  tools: z
    .array(
      z.object({
        type: z.literal("function"),
        function: z.object({
          name: z.string(),
          description: z.string().optional(),
          parameters: z.record(z.unknown()),
        }),
      })
    )
    .optional(),
  tool_choice: z
    .union([
      z.enum(["none", "auto", "required"]),
      z.object({
        type: z.literal("function"),
        function: z.object({ name: z.string() }),
      }),
    ])
    .optional(),
})

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>
