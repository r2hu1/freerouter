import chalk from "chalk"
import type { Hono } from "hono"

const METHOD_COLORS: Record<string, typeof chalk.cyan> = {
  GET: chalk.green,
  POST: chalk.yellow,
  PUT: chalk.blue,
  PATCH: chalk.magenta,
  DELETE: chalk.red,
  HEAD: chalk.cyan,
  OPTIONS: chalk.gray,
}

export function logRoutes(app: Hono) {
  const routes = (
    app as unknown as { routes: Array<{ method: string; path: string }> }
  ).routes
  if (!routes) return

  const sorted = [...routes].sort((a, b) => a.path.localeCompare(b.path))

  console.log(chalk.bold("\nRegistered routes:"))
  for (const r of sorted) {
    const color = METHOD_COLORS[r.method] ?? chalk.white
    console.log(`  ${color(r.method.padEnd(7))} ${r.path}`)
  }
  console.log()
}
