import { FreeRouterAllProvidersFailedError } from "@freerouter/sdk"
import type { FreeRouterError } from "@freerouter/sdk"
import { ZodError } from "zod"

const KEY_PATTERN = /[A-Za-z0-9_-]{8,}/g

function sanitize(msg: string): string {
  return msg.replace(KEY_PATTERN, "[REDACTED]")
}

export function toOpenAiError(err: unknown): {
  status: number
  body: object
} {
  if (err instanceof FreeRouterAllProvidersFailedError) {
    return {
      status: 502,
      body: {
        error: {
          message: "All providers failed",
          type: "freerouter_all_providers_failed",
          code: "all_providers_failed",
        },
      },
    }
  }

  if (err instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: {
          message: sanitize(err.message),
          type: "invalid_request_error",
        },
      },
    }
  }

  if (isFreeRouterError(err)) {
    return {
      status: 502,
      body: {
        error: {
          message: sanitize(err.message),
          type: "freerouter_provider_error",
          code: "provider_error",
        },
      },
    }
  }

  return {
    status: 500,
    body: { error: { message: "Internal error", type: "server_error" } },
  }
}

function isFreeRouterError(err: unknown): err is FreeRouterError {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "FreeRouterError"
  )
}
