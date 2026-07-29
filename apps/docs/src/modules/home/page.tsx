import { Hero } from "./hero"
import { Features } from "./features"
import { ModelsCta } from "./models-cta"

export function HomePageModule() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <ModelsCta />
    </main>
  )
}
