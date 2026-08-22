import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto"

const ALGO = "aes-256-gcm"
const IV_LEN = 12
const KEY_LEN = 32

export interface EncryptedBlob {
  iv: string
  tag: string
  ct: string
}

export function generateMasterSecret(): string {
  return randomBytes(KEY_LEN).toString("hex")
}

export function generateSalt(): string {
  return randomBytes(16).toString("hex")
}

export function encrypt(
  plaintext: string,
  masterSecret: string
): EncryptedBlob {
  const key = Buffer.from(masterSecret, "hex")
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    ct: ct.toString("hex"),
  }
}

export function decrypt(blob: EncryptedBlob, masterSecret: string): string {
  const key = Buffer.from(masterSecret, "hex")
  const iv = Buffer.from(blob.iv, "hex")
  const tag = Buffer.from(blob.tag, "hex")
  const ct = Buffer.from(blob.ct, "hex")
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const pt = Buffer.concat([decipher.update(ct), decipher.final()])
  return pt.toString("utf8")
}

export function hashSecret(secret: string, salt: string): string {
  return scryptSync(secret, salt, KEY_LEN).toString("hex")
}

export function generateGatewayKey(): string {
  return `fr-live-${randomBytes(24).toString("base64url")}`
}

export function generateId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`
}

export function maskSecret(secret: string, visible = 4): string {
  if (secret.length <= visible + 3) return "***"
  return `${secret.slice(0, visible)}…${secret.slice(-3)}`
}
