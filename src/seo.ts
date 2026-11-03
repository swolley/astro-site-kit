/** Longest title that a results page shows whole. */
export const TITLE_MAX = 60;
/** A description shorter than this says too little; one longer than the maximum is cut by the results page. */
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 155;

const SEPARATOR = ' | ';
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Drops the parts of a title ("Page | Section | Site") from the right until it fits. The first part always stays. */
export function fitTitle(title: string, max = TITLE_MAX): string {
    const parts = title.split(SEPARATOR);
    while (parts.length > 1 && parts.join(SEPARATOR).length > max) {
        parts.pop();
    }
    return parts.join(SEPARATOR);
}

/** The text of an HTML fragment: tags removed, entities decoded, white space collapsed. */
export function textOf(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity: string, body: string) => {
            if (body.startsWith('#')) {
                const code = body[1]?.toLowerCase() === 'x' ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
                return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
            }
            return ENTITIES[body.toLowerCase()] ?? entity;
        })
        .replace(/\s+/g, ' ')
        .trim();
}

/** At most `max` characters: up to the last full sentence that is long enough, or else up to a word with an ellipsis. */
export function clip(text: string, max = DESCRIPTION_MAX): string {
    const flat = text.replace(/\s+/g, ' ').trim();
    if (flat.length <= max) {
        return flat;
    }
    const sentenceEnd = flat.slice(0, max).lastIndexOf('. ');
    if (sentenceEnd + 1 >= DESCRIPTION_MIN) {
        return flat.slice(0, sentenceEnd + 1);
    }
    const cut = flat.slice(0, max - 1);
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:(-]+$/, '')}…`;
}

/** The text clipped for a description, or the fallback when there is too little of it. */
export function describe(text: string, fallback: string): string {
    const flat = text.replace(/\s+/g, ' ').trim();
    return flat.length >= DESCRIPTION_MIN ? clip(flat) : fallback;
}

export type BuiltPage = { path: string; html: string };

/**
 * The addresses for the sitemap: the pages that name themselves as their canonical address and do not ask to be left
 * out. A page with no canonical (the 404) and a copy that points to another page are not listed.
 */
export function sitemapUrls(pages: readonly BuiltPage[], origin: string): string[] {
    const urls = new Set<string>();
    for (const { path, html } of pages) {
        const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
        if (canonical === undefined || /<meta name="robots" content="[^"]*noindex/i.test(html)) {
            continue;
        }
        if (canonical === new URL(path, origin).href) {
            urls.add(canonical);
        }
    }
    return [...urls].sort();
}

const escapeXml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function sitemapXml(urls: readonly string[]): string {
    const entries = urls.map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
