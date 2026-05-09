import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./global.css";

export const metadata: Metadata = {
  title: { template: "%s | OpenMoney Docs", default: "OpenMoney Docs" },
  description: "Documentation for the OpenMoney quantitative investment platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body style={{ 
        margin: 0, 
        background: "#0C0C0F", 
        color: "#F0EFED", 
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
      }}>
        {children}
      </body>
    </html>
  );
}
