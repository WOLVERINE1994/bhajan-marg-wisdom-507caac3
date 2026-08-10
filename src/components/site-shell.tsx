import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/ask", label: "Ask" },
  { to: "/topics", label: "Topics" },
  { to: "/sources", label: "Sources" },
  { to: "/finder", label: "Satsang Finder" },
  { to: "/saved", label: "Saved" },
  { to: "/about", label: "Methodology" },
  { to: "/admin", label: "Admin" },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/25">
        <span className="font-deva text-base leading-none">ॐ</span>
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold text-foreground">
          Bhajan Marg Wisdom AI
        </span>
        <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Source-grounded study tool
        </span>
      </span>
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="bg-secondary/70 px-4 py-2 text-center text-[11px] leading-snug text-secondary-foreground sm:text-xs">
        Independent study tool. Not affiliated with, endorsed by, or representing Pujya Shri Hit
        Premanand Govind Sharan Ji Maharaj or Shri Hit Radha Keli Kunj.
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Brand />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/ask">Poochhein</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="mt-8 flex flex-col gap-1">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: item.to === "/" }}
                      className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-border/70 bg-paper-deep/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Brand />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Every answer is either a short verbatim excerpt from a cited source or an
              AI-generated synthesis based on cited teachings. We never invent quotations,
              timestamps or attributions, and we always link back to the original.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {NAV.slice(1, 5).map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Trust
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="transition-colors hover:text-foreground">
                  Methodology & limits
                </Link>
              </li>
              <li>
                <Link to="/sources" className="transition-colors hover:text-foreground">
                  Source registry
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-foreground">
                  Ingestion status
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
          Please verify all guidance through the original satsangs. Radhe Radhe.
        </div>
      </footer>
    </div>
  );
}
