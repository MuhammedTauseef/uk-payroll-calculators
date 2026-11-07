// The blog post validation the admin editor enforces — one source of
// truth for the save action, mirroring the reference sites' rules
// exactly (same limits, same refusal messages):
//   * title ≤ 60 characters (it doubles as the meta title)
//   * description ≤ 160 characters (it doubles as the meta description)
//   * slug: lowercase letters, numbers and hyphens only
//   * publishing requires all 5 FAQ pairs completed

export type BlogFaqPair = { q: string; a: string };

export type BlogPostInput = {
  title: string;
  slug: string;
  description: string;
  body: string;
  coverImageUrl: string;
  status: string;
};

export type ValidatedBlogPost = {
  slug: string;
  title: string;
  description: string;
  body: string;
  faqs: BlogFaqPair[];
  cover_image_url: string | null;
  status: "draft" | "published";
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Validate the editor's fields; returns the first refusal message. */
export function validateBlogPostInput(
  input: BlogPostInput,
): { ok: true; value: Omit<ValidatedBlogPost, "faqs"> } | { ok: false; message: string } {
  const title = input.title.trim();
  if (title.length < 1) return { ok: false, message: "A title is required." };
  if (title.length > 60) return { ok: false, message: "Keep the title to 60 characters or fewer." };

  const slug = input.slug.trim();
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      message: "The slug may only use lowercase letters, numbers and hyphens.",
    };
  }

  const description = input.description.trim();
  if (description.length > 160) {
    return { ok: false, message: "Keep the description to 160 characters or fewer." };
  }

  if (input.body.length > 200_000) {
    return { ok: false, message: "The body is too long." };
  }

  const coverImageUrl = input.coverImageUrl.trim();
  if (coverImageUrl.length > 2000) {
    return { ok: false, message: "The cover image address is too long." };
  }
  if (coverImageUrl !== "" && !isUrl(coverImageUrl)) {
    return {
      ok: false,
      message: "The cover image must be a full web address (https://…), or left empty.",
    };
  }

  if (input.status !== "draft" && input.status !== "published") {
    return { ok: false, message: "Choose whether this is a draft or published." };
  }

  return {
    ok: true,
    value: {
      slug,
      title,
      description,
      body: input.body,
      cover_image_url: coverImageUrl === "" ? null : coverImageUrl,
      status: input.status,
    },
  };
}

/** The editor renders exactly 5 FAQ pairs; keep the completed ones. */
export function readBlogFaqs(formData: FormData): BlogFaqPair[] {
  const faqs: BlogFaqPair[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const q = String(formData.get(`faqQ${i}`) ?? "").trim();
    const a = String(formData.get(`faqA${i}`) ?? "").trim();
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

export const PUBLISH_FAQS_MESSAGE =
  "A published post needs all 5 FAQs filled in. Complete the FAQ questions and answers, or save as a draft.";
