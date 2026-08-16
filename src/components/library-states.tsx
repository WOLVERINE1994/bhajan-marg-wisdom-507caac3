import { Link } from "@tanstack/react-router";

import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

/** Shown when a corpus read from the backend fails. */
export function LibraryErrorState() {
  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          The library could not be loaded
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The source corpus is temporarily unreachable. Nothing has been guessed or substituted —
          please try again in a moment.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}

export function LibraryNotFoundState() {
  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">Not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          That page does not exist in this library.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
