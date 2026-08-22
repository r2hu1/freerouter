import { randomBytes } from "node:crypto"
import type { FreeRouterKeys, ProviderId } from "@freerouter/sdk"
import type { Context } from "hono"
import {
  resolveKeysFromHeaders,
  resolveKeysFromStore,
} from "./mapping/resolve-keys"
import { verifyGatewayKey } from "./storage/keys"

export const SESSION_TOKEN = randomBytes(24).toString("base64url")

export function isLocalhost(c: Context): boolean {
  const host = c.req.header("host") ?? ""
  return (
    host.startsWith("127.0.0.1") ||
    host.startsWith("localhost") ||
    host.startsWith("[::1]") ||
    host.startsWith("::1")
  )
}

export function requireSession(c: Context): boolean {
  const header = c.req.header("x-freerouter-session")
  if (header && header === SESSION_TOKEN) return true
  return isLocalhost(c)
}

export function extractBearer(c: Context): string | null {
  const auth = c.req.header("authorization")
  if (!auth) return null
  const parts = auth.split(" ")
  const scheme = parts[0]
  const token = parts[1]
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null
  return token
}

export interface AuthResult {
  gatewayKeyId: string | null
  keys: FreeRouterKeys
  error?: { status: number; body: object }
}

export async function authenticateProxy(c: Context): Promise<AuthResult> {
  const byok = resolveKeysFromHeaders(c.req.raw.headers)
  const bearer = extractBearer(c)
  let gatewayKeyId: string | null = null

  if (bearer) {
    const gk = await verifyGatewayKey(bearer)
    if (!gk) {
      return {
        gatewayKeyId: null,
        keys: {},
        error: {
          status: 401,
          body: {
            error: {
              message: "Invalid gateway key",
              type: "invalid_request_error",
            },
          },
        },
      }
    }
    gatewayKeyId = gk.id
  }

  const storeKeys = await resolveKeysFromStore()
  const keys: FreeRouterKeys = { ...storeKeys, ...byok }

  if (!bearer && Object.keys(byok).length === 0) {
    return {
      gatewayKeyId: null,
      keys: {},
      error: {
        status: 401,
        body: {
          error: {
            message:
              "Authentication required: provide a FreeRouter gateway key via Authorization: Bearer fr-live-..., or supply provider BYOK headers.",
            type: "invalid_request_error",
          },
        },
      },
    }
  }

  return { gatewayKeyId, keys }
}

export function parseAlias(model: string): string {
  const slashIdx = model.indexOf("/")
  return slashIdx > 0 ? model.slice(slashIdx + 1) : model
}

export function parseProvider(model: string): string | null {
  const slashIdx = model.indexOf("/")
  return slashIdx > 0 ? model.slice(0, slashIdx) : null
}

export type { ProviderId }
