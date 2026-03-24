import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
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

export const metadata: Metadata = {
  title: "SciSpark — AI visual learning for kids",
  description:
    "Interactive science and math playground: ask questions, see animated simulations, drag blocks like Scratch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[linear-gradient(145deg,#fdf4ff_0%,#e0f2fe_45%,#fef9c3_100%)] font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
