import Link from "next/link";
import { source } from "@/lib/source";
import { type Folder, type Item, type Node } from "fumadocs-core/page-tree";
import type { ReactNode } from "react";

function isFolder(node: Node): node is Folder {
  return node.type === "folder";
}

function isItem(node: Node): node is Item {
  return node.type === "page";
}

function Sidebar() {
  const tree = source.getPageTree();

  return (
    <aside className="docs-sidebar">
      <Link href="/docs" style={{ display: "block", fontSize: "1rem", fontWeight: 700, color: "#F0EFED", textDecoration: "none", marginBottom: "1.5rem", letterSpacing: "-0.01em" }}>
        OpenMoney Docs
      </Link>
      {tree.children.map((node) => {
        if (isFolder(node)) {
          return (
            <div key={String(node.name)} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6B6A78", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                {node.name}
              </div>
              {node.children.map((child) => {
                if (isItem(child)) {
                  return (
                    <Link
                      key={child.url}
                      href={child.url}
                      style={{ paddingLeft: "0.75rem" }}
                    >
                      {child.name}
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          );
        }
        if (isItem(node)) {
          return (
            <Link
              key={node.url}
              href={node.url}
              style={{ fontWeight: 500 }}
            >
              {node.name}
            </Link>
          );
        }
        return null;
      })}
    </aside>
  );
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Sidebar />
      <div className="docs-main">{children}</div>
    </div>
  );
}
