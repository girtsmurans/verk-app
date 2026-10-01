import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verk",
  description: "Darba uzdevumu un laika uzskaites aplikācija",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lv">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
