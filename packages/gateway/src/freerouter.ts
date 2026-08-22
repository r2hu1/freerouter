import { createFreeRouter, createMemoryHealthStore } from "@freerouter/sdk"
import type { FreeRouter } from "@freerouter/sdk"

let _router: FreeRouter | null = null

export function getRouter(): FreeRouter {
  if (!_router) {
    _router = createFreeRouter({ healthStore: createMemoryHealthStore() })
  }
  return _router
}
