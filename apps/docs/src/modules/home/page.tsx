import { Hero } from "./hero";
import { Features } from "./features";

export function HomePageModule() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
    </main>
  );
}
