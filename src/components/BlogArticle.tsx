import Link from "next/link";
import type { BlogBodyBlock, BlogTextSegment } from "@/lib/blog/markup";
import { parseBlogBody } from "@/lib/blog/markup";

// Renders a blog post body (the light markup from lib/blog/markup.ts).
// Every segment is a React text node, so post text is always escaped;
// the only elements a post can produce besides the block structure
// are anchors built from validated link segments: internal
// [text](/path) links via next/link, external [text](https://…)
// links as a plain <a> opening in a new tab with
// rel="noopener noreferrer". Styling matches the guide pages
// (slate text, brand links).

const LINK_CLASS = "font-medium text-brand-800 underline";

function Segments({ segments }: { segments: BlogTextSegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.kind === "link" ? (
          segment.external ? (
            <a
              key={index}
              className={LINK_CLASS}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {segment.text}
            </a>
          ) : (
            <Link key={index} className={LINK_CLASS} href={segment.href}>
              {segment.text}
            </Link>
          )
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: BlogBodyBlock }) {
  if (block.kind === "heading") {
    return (
      <h2 className="mt-10 text-xl font-semibold text-slate-900">
        <Segments segments={block.segments} />
      </h2>
    );
  }
  if (block.kind === "list") {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700">
        {block.items.map((item, index) => (
          <li key={index}>
            <Segments segments={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mt-4 text-base leading-relaxed text-slate-700">
      <Segments segments={block.segments} />
    </p>
  );
}

export function BlogArticleBody({ body }: { body: string }) {
  const blocks = parseBlogBody(body);
  return (
    <div className="min-w-0">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
