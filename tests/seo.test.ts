import { describe, expect, it } from 'vitest';
import { clip, fitTitle, sitemapUrls, sitemapXml, textOf } from '../src/seo.ts';

const ORIGIN = 'https://example.com';

describe('fitTitle', () => {
    it('keeps a title that fits', () => {
        expect(fitTitle('Short')).toBe('Short');
        expect(fitTitle('Docs | Site')).toBe('Docs | Site');
    });

    it('drops the parts from the right until the title fits', () => {
        const title = 'Choosing the AI model of each feature, easily | Module | Site';
        expect(fitTitle(title, 55)).toBe('Choosing the AI model of each feature, easily | Module');
        expect(fitTitle('A | B | C', 4)).toBe('A');
    });

    it('never drops the first part, however long it is', () => {
        const long = 'Working with your data through the assistant and the tools it can reach, user guide';
        expect(fitTitle(`${long} | Module | Site`)).toBe(long);
    });
});

describe('textOf', () => {
    it('removes tags, decodes entities and collapses white space', () => {
        expect(textOf('<b>a&amp;b</b>&#x41;')).toBe('a&bA');
        expect(textOf('<p>Use <code>a &amp; b</code>,\n   not &lt;c&gt; &#39;d&#39; &#x3C;e&#x3E; &nbsp;f</p>')).toBe(
            "Use a & b, not <c> 'd' <e> f",
        );
    });

    it('leaves an entity it does not know, and a code point out of range', () => {
        expect(textOf('&unknown; &#99999999;')).toBe('&unknown; &#99999999;');
    });
});

describe('clip', () => {
    it('leaves a short text alone', () => {
        expect(clip('One short sentence.')).toBe('One short sentence.');
    });

    it('ends on the last full sentence that is long enough', () => {
        const text = `${'First sentence that is long enough to stand alone on a results page, with room to spare'}. ${'Second sentence that does not fit in the space that is left for it.'}`;
        expect(clip(text, 120)).toBe('First sentence that is long enough to stand alone on a results page, with room to spare.');
    });

    it('cuts at a word and adds an ellipsis when no sentence ends in range', () => {
        const text = 'word '.repeat(60).trim();
        const clipped = clip(text, 40);
        expect(clipped.length).toBeLessThanOrEqual(40);
        expect(clipped.endsWith('word…')).toBe(true);
    });
});

describe('sitemap', () => {
    const page = (path: string, canonical: string | null, extra = '') => ({
        path,
        html: `<html><head>${canonical === null ? '' : `<link rel="canonical" href="${canonical}">`}${extra}</head></html>`,
    });

    it('lists the pages whose canonical is their own address, sorted', () => {
        const urls = sitemapUrls(
            [
                page('/roadmap', `${ORIGIN}/roadmap`),
                page('/', `${ORIGIN}/`),
                page('/docs/glossary', `${ORIGIN}/docs/glossary`),
                page('/docs/rag-glossary', `${ORIGIN}/docs/glossary`),
                page('/404', null),
                page('/hidden', `${ORIGIN}/hidden`, '<meta name="robots" content="noindex, follow">'),
            ],
            ORIGIN,
        );
        expect(urls).toEqual([`${ORIGIN}/`, `${ORIGIN}/docs/glossary`, `${ORIGIN}/roadmap`]);
    });

    it('writes the XML with the addresses escaped', () => {
        expect(sitemapXml(['https://x/a&b'])).toContain('<loc>https://x/a&amp;b</loc>');
        const xml = sitemapXml([`${ORIGIN}/`, `${ORIGIN}/a?x=1&y=2`]);
        expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')).toBe(true);
        expect(xml).toContain('<url><loc>https://example.com/</loc></url>');
        expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
    });
});
