import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-fd-border">
      <div className="mx-auto px-6 py-8 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-fd-muted-foreground">
        <p>
          Built by{" "}
          <a
            href="https://github.com/r2hu1"
            className="hover:text-fd-foreground transition-colors"
          >
            r2hu1
          </a>{" "}
          (Rahul Rajput)
        </p>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="hover:text-fd-foreground transition-colors">
            Docs
          </Link>
          <Link href="/models" className="hover:text-fd-foreground transition-colors">
            Models
          </Link>
          <a
            href="https://github.com/r2hu1/freerouter"
            className="hover:text-fd-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
