"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveBlogPostAction } from "@/lib/admin/actions";
import type { AdminBlogPostRow } from "@/lib/admin/data";
import { adminActionIdle, type AdminActionState } from "@/lib/admin/state";
import { createClient } from "@/lib/supabase/client";

// The WordPress-style blog editor, mirroring the reference sites'
// form: title/slug/description, a cover upload that runs on the
// admin's own signed-in session, the light-markup body, 5 FAQ pairs
// (all required to publish) and a Draft/Published status select.

const COVER_BUCKET = "blog-images";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60";
const labelClass = "block text-sm font-medium text-slate-900 dark:text-slate-50";
const hintClass = "mt-1 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400";
const primaryButtonClass =
  "inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60";
const outlineButtonClass =
  "inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60";

function sanitizeCoverFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+\./g, ".")
    .replace(/\.-+/g, ".")
    .replace(/^[-.]+|[-.]+$/g, "");
  if (cleaned === "") return "cover-image";
  return cleaned.startsWith(".") ? `cover${cleaned}` : cleaned;
}

// Best-effort tidy-up: when a cover is removed or replaced, the
// stored object is deleted too, so unreferenced uploads do not pile
// up in the public bucket. Failures are ignored on purpose — the
// saved URL field is what decides what renders, never this cleanup.
async function deleteCoverObject(publicUrl: string): Promise<void> {
  try {
    const marker = `/object/public/${COVER_BUCKET}/`;
    const at = publicUrl.indexOf(marker);
    if (at === -1) return;
    const path = decodeURIComponent(publicUrl.slice(at + marker.length).split("?")[0]);
    if (!path) return;
    const supabase = createClient();
    await supabase.storage.from(COVER_BUCKET).remove([path]);
  } catch {
    // Ignored: cleanup only.
  }
}

function ActionNotice({ state }: { state: AdminActionState }) {
  if (state.status === "idle" || !state.message) return null;
  const tone =
    state.status === "success"
      ? "border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 text-brand-900 dark:text-brand-100"
      : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300";
  return (
    <p role="status" className={`rounded-lg border px-4 py-3 text-sm leading-6 ${tone}`}>
      {state.message}
    </p>
  );
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FAQ_SLOTS = [1, 2, 3, 4, 5] as const;

export function BlogPostForm({ post }: { post: AdminBlogPostRow | null }) {
  const [state, action, pending] = useActionState(
    saveBlogPostAction.bind(null, post?.id ?? null),
    adminActionIdle,
  );
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(post !== null);
  const [description, setDescription] = useState(post?.description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  // The upload runs in the browser on the admin's own signed-in
  // session (lib/supabase/client), so the bucket's admin-only write
  // policies are what allow it — no service-role key is involved. On
  // success the bucket's public URL lands in the hidden coverImageUrl
  // field and the normal Save (server action) persists it.
  const onCoverFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `blog/${crypto.randomUUID()}/${sanitizeCoverFileName(file.name)}`;
      const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
      const previousUrl = coverUrl;
      setCoverUrl(data.publicUrl);
      if (previousUrl && previousUrl !== data.publicUrl) void deleteCoverObject(previousUrl);
    } catch {
      setUploadError(
        "That image could not be uploaded. Check it is an image file under 10 MB and try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const onRemoveCover = () => {
    const previousUrl = coverUrl;
    setCoverUrl("");
    setUploadError(null);
    if (previousUrl) void deleteCoverObject(previousUrl);
  };

  return (
    <form action={action} className="space-y-6">
      <div>
        <label className={labelClass} htmlFor="blog-title">
          Title (also the meta title — 60 characters or fewer)
        </label>
        <input
          id="blog-title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={60}
          required
          disabled={pending}
          className={inputClass}
        />
        <span className={hintClass}>{title.length} / 60</span>
      </div>

      <div>
        <label className={labelClass} htmlFor="blog-slug">
          Slug (the end of the web address: /blog/…)
        </label>
        <input
          id="blog-slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugEdited(true);
          }}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          required
          disabled={pending}
          className={inputClass}
        />
        <span className={hintClass}>
          Lowercase letters, numbers and hyphens only. It fills itself from the title until you
          edit it.
        </span>
      </div>

      <div>
        <label className={labelClass} htmlFor="blog-description">
          Meta description (shown on the blog list and in search results)
        </label>
        <textarea
          id="blog-description"
          name="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={160}
          disabled={pending}
          className={inputClass}
        />
        <span className={hintClass}>{description.length} / 160</span>
      </div>

      <div>
        <label className={labelClass} htmlFor="blog-cover-file">
          Cover image (shown on the blog list and at the top of the article)
        </label>
        {coverUrl && (
          <div className="mt-2 space-y-2">
            <Image
              src={coverUrl}
              alt="Cover preview"
              width={1280}
              height={720}
              className="aspect-video w-full rounded-lg border border-slate-200 dark:border-slate-800 object-cover"
            />
            <button
              type="button"
              className={outlineButtonClass}
              onClick={onRemoveCover}
              disabled={pending || uploading}
            >
              Remove image
            </button>
          </div>
        )}
        <input
          id="blog-cover-file"
          type="file"
          accept="image/*"
          onChange={onCoverFileChange}
          disabled={pending || uploading}
          className="mt-2 block text-sm text-slate-700 dark:text-slate-300"
        />
        <input type="hidden" name="coverImageUrl" value={coverUrl} />
        {uploading && <span className={hintClass}>Uploading…</span>}
        {uploadError && (
          <p role="alert" className="mt-1 text-sm font-normal leading-6 text-red-700 dark:text-red-400">
            {uploadError}
          </p>
        )}
        <span className={hintClass}>
          Pick an image and it uploads straight away — then press Save post to keep it on the
          article. A wide image (16:9) looks best. Images up to 10 MB.
        </span>
      </div>

      <div>
        <label className={labelClass} htmlFor="blog-body">
          Body
        </label>
        <textarea
          id="blog-body"
          name="body"
          rows={22}
          defaultValue={post?.body ?? ""}
          disabled={pending}
          className={`${inputClass} font-mono text-[13px] leading-6`}
        />
        <span className={hintClass}>
          Simple markup only — everything is shown as plain text, never raw HTML. Start a line
          with <strong>## </strong> for a section heading, with <strong>- </strong> for a bullet
          list, and leave a blank line between paragraphs. There is no bold or italic —{" "}
          <strong>**stars**</strong> would show as plain stars. Link like this: [the words to
          show](/ssp-calculator) for pages on this site, or [the words](https://example.com) for
          outside sites (they open in a new tab). Anything else that looks like a link shows as
          plain text. An image goes on a line of its own, like this:{" "}
          <strong>![a short description](https://…/image.webp &quot;a caption&quot;)</strong>{" "}
          — the caption in quotes is optional, and the image address must be a page on this site
          or a full https address. A table is lines starting with{" "}
          <strong>|</strong>, with a <strong>|---|---|</strong> separator line under the
          headings: <strong>| Heading | Heading |</strong> first, then one{" "}
          <strong>| cell | cell |</strong> line per row.
        </span>
      </div>

      <fieldset className="space-y-5">
        <legend className="text-sm font-medium text-slate-900 dark:text-slate-50">
          FAQs (all 5 are required to publish)
        </legend>
        {FAQ_SLOTS.map((slot) => (
          <div key={slot} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`faq-q-${slot}`}>
                Question {slot}
              </label>
              <input
                id={`faq-q-${slot}`}
                name={`faqQ${slot}`}
                type="text"
                defaultValue={post?.faqs[slot - 1]?.q ?? ""}
                disabled={pending}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`faq-a-${slot}`}>
                Answer {slot}
              </label>
              <textarea
                id={`faq-a-${slot}`}
                name={`faqA${slot}`}
                rows={3}
                defaultValue={post?.faqs[slot - 1]?.a ?? ""}
                disabled={pending}
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className={labelClass} htmlFor="blog-status">
            Status
          </label>
          <select
            id="blog-status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "draft" | "published")}
            disabled={pending}
            className={inputClass}
          >
            <option value="draft">Draft — only you can see it</option>
            <option value="published">Published — live on the blog</option>
          </select>
        </div>
        <button type="submit" className={primaryButtonClass} disabled={pending || uploading}>
          {pending ? "Saving…" : uploading ? "Uploading…" : "Save post"}
        </button>
        {post?.status === "published" && (
          <Link
            className="pb-2 font-medium text-brand-800 dark:text-brand-300 underline"
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            View post
          </Link>
        )}
      </div>

      <ActionNotice state={state} />
    </form>
  );
}
