import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { GradeProvider } from "@/lib/grade-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ting Xie | Chinese handwriting practice",
  description: "Practice, scan, and improve Chinese handwriting with Ting Xie.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo-notext.png",
        type: "image/png",
        sizes: "500x500",
      },
    ],
    apple: "/logo-notext.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ting Xie",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#f6f8f5]">
      <body className="antialiased" suppressHydrationWarning>
        <GradeProvider>{children}</GradeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
