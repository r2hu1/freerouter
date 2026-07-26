import { createHash } from "node:crypto"

export function fingerprintKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 16)
}
