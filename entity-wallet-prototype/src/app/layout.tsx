import type { Metadata } from "next";
import { DM_Mono, Host_Grotesk, Inter } from "next/font/google";

import { DemoHarness } from "@/components/demo/DemoHarness";
import { ScreenStateProvider } from "@/components/demo/screenState";
import { Atmosphere } from "@/components/layout/Atmosphere";
import { DemoProvider } from "@/lib/demoStore";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NDI Studio — Bhutan NDI",
  description:
    "Issue and verify credentials on the Bhutan National Digital Identity network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${hostGrotesk.variable} ${inter.variable} ${dmMono.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        {/* Blocking on purpose: it sets data-theme before the first paint, so
            a light-theme visitor never sees the dark ground flash first. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {/* isolate creates the stacking context the atmosphere layers sit behind */}
        {/* Everything the app lists or creates lives in this store. There is
            no backend by design: the Studio's front end runs against an
            in-browser model so the whole product can be driven in a demo. */}
        <DemoProvider>
          {/* The screen-state registry wraps the tree so a page can declare
              its states and the harness bar, which is a sibling rather than
              an ancestor of the page, can offer them. */}
          <ScreenStateProvider>
            <div className="relative isolate min-h-screen">
              <Atmosphere />
              {/* overflow-x-clip, not hidden: hidden would create a scroll container
                  and break sticky positioning. */}
              <div className="relative z-[1] overflow-x-clip">
                {children}
                {/* Room for the demo bar fixed along the bottom of the window.
                    Without it a page exactly one screen tall — the register's
                    list on a phone — had its primary button permanently under
                    the bar, with no scroll left to bring it clear. Two rows'
                    worth on a phone, where the bar wraps. */}
                <div aria-hidden="true" className="h-[104px] min-[641px]:h-16" />
              </div>
            </div>
            {/* Outside the content column: it is scaffolding, not product. */}
            <DemoHarness />
          </ScreenStateProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
