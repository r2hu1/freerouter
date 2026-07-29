import type { Metadata } from "next"
import { HomePageModule } from "@/modules/home/page"

export const metadata: Metadata = {
  title: "FreeRouter - Route across free LLMs with a single API",
  description:
    "Completely free ($0 cost) routing across free LLM models and providers. Like OpenRouter, but for free models.",
  openGraph: {
    images: "/opengraph.svg",
  },
}

export default function HomePage() {
  return <HomePageModule />
}
