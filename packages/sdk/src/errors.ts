export class FreeRouterError extends Error {
  readonly provider: string

  constructor(message: string, provider: string, cause?: unknown) {
    super(message, cause ? { cause } : undefined)
    this.name = "FreeRouterError"
    this.provider = provider
  }
}

export class FreeRouterAllProvidersFailedError extends FreeRouterError {
  readonly errors: FreeRouterError[]

  constructor(errors: FreeRouterError[]) {
    const msg = `All providers failed: ${errors.map((e) => `${e.provider}: ${e.message}`).join("; ")}`
    super(msg, "all", errors)
    this.name = "FreeRouterAllProvidersFailedError"
    this.errors = errors
  }
}
