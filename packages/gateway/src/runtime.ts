import { spawn } from "node:child_process"

// Re-exec the current process (same args) so that config changes that can only
// be applied at startup (port, host, CORS, default alias, logging, auth) take
// effect. The current process exits after spawning the replacement.
export function restartGateway(): void {
  if (process.env.FREEROUTER_NO_RESTART === "1") return
  try {
    const child = spawn(process.execPath, process.argv.slice(1), {
      env: process.env,
      stdio: "inherit",
      detached: true,
    })
    child.unref()
  } catch (e) {
    console.error("Failed to restart gateway:", e)
    return
  }
  process.exit(0)
}
