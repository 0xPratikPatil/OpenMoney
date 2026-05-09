import { source } from "@/lib/source";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import type { Metadata } from "next";

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const slug = (await params).slug;
  const page = source.getPage(slug);
  if (!page) return <div>Page not found</div>;
  
  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <page.data.body />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const slug = (await params).slug;
  const page = source.getPage(slug);
  if (!page) return {};
  return { title: page.data.title };
}
