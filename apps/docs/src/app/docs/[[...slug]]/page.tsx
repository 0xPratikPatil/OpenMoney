import { source } from "@/lib/source";
import { notFound } from "next/navigation";

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article>
      <h1>{page.data.title}</h1>
      {page.data.description && (
        <p style={{ color: "#8E8D96", fontSize: "1.1rem", marginBottom: "2rem" }}>
          {page.data.description}
        </p>
      )}
      <MDX />
    </article>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
  };
}
