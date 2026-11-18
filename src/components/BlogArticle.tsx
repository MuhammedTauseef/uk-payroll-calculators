import Link from "next/link";
import type { BlogBodyBlock, BlogTextSegment } from "@/lib/blog/markup";
import { parseBlogBody } from "@/lib/blog/markup";

// Renders a blog post body (the light markup from lib/blog/markup.ts).
// Every segment is a React text node, so post text is always escaped;
// the only elements a post can produce besides the block structure
// are anchors built from validated link segments, images from
// validated image lines (plain <img>: the src is a validated link
// target, never author HTML), and tables built from validated table
// rows. Internal [text](/path) links render via next/link, external
// [text](https://…) links as a plain <a> opening in a new tab with
// rel="noopener noreferrer". Styling matches the guide pages
// (slate text, brand links).

const LINK_CLASS = "font-semibold text-brand-700 dark:text-brand-300 underline decoration-2 underline-offset-2 hover:text-brand-900 dark:hover:text-brand-100";

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
      <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
        <Segments segments={block.segments} />
      </h2>
    );
  }
  if (block.kind === "image") {
    return (
      <figure className="mt-8">
        <img
          src={block.src}
          alt={block.alt}
          loading="lazy"
          decoding="async"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800"
        />
        {block.caption !== null ? (
          <figcaption className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  if (block.kind === "table") {
    return (
      <>
        {/* Desktop/tablet (sm: and up): the real table. */}
        <div className="mt-8 hidden overflow-x-auto rounded-xl border border-slate-200 sm:block dark:border-slate-800">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm leading-6 text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {block.headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-50"
                  >
                    <Segments segments={header} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex % 2 === 1 ? "bg-slate-50 dark:bg-slate-900/40" : undefined
                  }
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-t border-slate-200 px-4 py-3 align-top dark:border-slate-800"
                    >
                      <Segments segments={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile (below sm:): stacked cards — one card per row, the
            first cell is the card title and every other cell is a
            "Header: value" line (owner order 2026-11-18: squeezed
            multi-column tables were unreadable on phones). */}
        <div className="mt-8 space-y-4 sm:hidden">
          {block.rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <p
                    key={cellIndex}
                    className="text-base leading-6 font-semibold text-slate-900 dark:text-slate-50"
                  >
                    <Segments segments={cell} />
                  </p>
                ) : (
                  <p
                    key={cellIndex}
                    className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-50">
                      <Segments segments={block.headers[cellIndex] ?? []} />
                      {": "}
                    </span>
                    <Segments segments={cell} />
                  </p>
                ),
              )}
            </div>
          ))}
        </div>
      </>
    );
  }
  if (block.kind === "list") {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed break-words text-slate-700 dark:text-slate-300">
        {block.items.map((item, index) => (
          <li key={index}>
            <Segments segments={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mt-4 text-base leading-relaxed break-words text-slate-700 dark:text-slate-300">
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
