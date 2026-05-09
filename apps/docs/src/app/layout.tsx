import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OpenMoney Docs",
  description: "Documentation for the OpenMoney platform",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", maxWidth: "800px", marginInline: "auto", lineHeight: 1.6 }}>
        {children}
      </body>
    </html>
  );
}
