import type { ReactNode } from "react";

/**
 * The page body for a detail screen: a header that spans the width, a reading
 * column, and an optional right rail of context.
 *
 * WHY THIS EXISTS RATHER THAN A max-w ON EACH VIEW
 *
 * Every detail screen had grown its own `max-w-[780px]` / `[820px]` /
 * `[860px]` wrapper, left-aligned inside a 1600px shell. On a laptop that is
 * fine; on anything wider it puts the whole screen in the left third and
 * leaves half the window empty, which reads as an unfinished page rather than
 * as a deliberate measure. Three different caps also meant the same kind of
 * screen sat at three different widths as you clicked between them.
 *
 * Two rules, applied in one place:
 *
 *   1. The column is centred, so the empty space is a margin rather than a
 *      void on one side.
 *   2. Anything that is context rather than the task — who is offering, who
 *      is asking, the trust-registry standing — moves into a rail beside the
 *      column once there is room for one (900px of the page's own width,
 *      not the window's, so a side panel narrowing the page stacks it).
 *      Below that it stacks under the main column rather than
 *      above it: on a phone the task comes first and the context is
 *      something you scroll to, which is the right priority on a screen that
 *      can only show one thing at a time.
 *
 * The measure itself does not change: line length is still governed by the
 * `max-w-[62ch]` on the paragraphs. What changes is where the block sits and
 * whether the width beside it is used for something.
 */
export function DetailLayout({
  header,
  side,
  children,
  /** The reading column's cap when there is no rail. */
  width = 880,
}: {
  header?: ReactNode;
  side?: ReactNode;
  children: ReactNode;
  width?: number;
}) {
  /* With a rail the two together are capped; without one the single column
     is. Expressed as an inline max-width because the value is a prop — a
     Tailwind arbitrary value would have to be a literal. */
  const cap = side ? 1320 : width;

  return (
    <div className="@container mx-auto flex w-full flex-col gap-5" style={{ maxWidth: cap }}>
      {header}
      {side ? (
        /* The rail appears when the page's own width has room for it, not the
           window's. Keyed to the viewport, the guided demo's side panel left
           a 1366px window with a 260px reading column beside a 380px rail,
           and the wallet scan card on the acceptance screen clipped. */
        <div className="grid gap-5 @min-[900px]:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] @min-[900px]:items-start">
          <div className="flex min-w-0 flex-col gap-5">{children}</div>
          {/* Sticky, because the rail is what you glance back at while
              working through the column — and short enough that it never
              needs to scroll on its own. */}
          <div className="flex min-w-0 flex-col gap-5 @min-[900px]:sticky @min-[900px]:top-[88px]">
            {side}
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
      )}
    </div>
  );
}
