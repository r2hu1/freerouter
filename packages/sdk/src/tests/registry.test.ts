import { describe, expect, test } from "bun:test"
import { fakeProvider } from "../__fixtures__/fake-provider"
import { createRegistry } from "../registry"

describe("Registry", () => {
  test("models returns full catalog regardless of keys", () => {
    const adapters = [
      fakeProvider({ id: "groq" }),
      fakeProvider({ id: "google" }),
    ]
    const registry = createRegistry(adapters)
    const models = registry.models()
    expect(models.length).toBe(2)
  })

  test("modelsWithCapability filters correctly", () => {
    const groq = fakeProvider({
      id: "groq",
      models: [
        {
          provider: "groq",
          modelId: "fast-model",
          capabilities: ["fast"],
          contextWindow: 4096,
          free: true,
        },
        {
          provider: "groq",
          modelId: "reason-model",
          capabilities: ["reasoning"],
          contextWindow: 4096,
          free: true,
        },
      ],
    })
    const registry = createRegistry([groq])
    const fast = registry.modelsWithCapability("fast")
    expect(fast.length).toBe(1)
    expect(fast[0]!.modelId).toBe("fast-model")
  })

  test("get finds model by provider and modelId", () => {
    const adapters = [fakeProvider({ id: "groq" })]
    const registry = createRegistry(adapters)
    const m = registry.get("groq", "fake-model-1")
    expect(m).toBeDefined()
    expect(m!.provider).toBe("groq")
  })

  test("get returns undefined for unknown model", () => {
    const adapters = [fakeProvider({ id: "groq" })]
    const registry = createRegistry(adapters)
    const m = registry.get("groq", "non-existent")
    expect(m).toBeUndefined()
  })

  test("adapter returns correct adapter for provider", () => {
    const adapters = [fakeProvider({ id: "groq" })]
    const registry = createRegistry(adapters)
    const a = registry.adapter("groq")
    expect(a.id).toBe("groq")
  })

  test("adapter throws for unknown provider", () => {
    const registry = createRegistry([])
    expect(() => registry.adapter("groq")).toThrow()
  })
})
