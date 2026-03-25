import type { Metadata } from "next";
import { Caveat, Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const display = Fredoka({
  variable: "--font-scispark-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const body = Nunito({
  variable: "--font-scispark-body",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const boardNote = Caveat({
  variable: "--font-board-note",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Understand — AI whiteboard",
  description:
    "Ask questions; AI draws and explains on a live whiteboard with stroke-by-step visuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${boardNote.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[linear-gradient(145deg,#fdf4ff_0%,#e0f2fe_45%,#fef9c3_100%)] font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
