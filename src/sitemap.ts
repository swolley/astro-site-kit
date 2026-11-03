import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { sitemapUrls, sitemapXml, type BuiltPage } from './seo.ts';

/** The HTML files under `dir`, each with the path it is served at: `docs/core/index.html` is `/docs/core`. */
async function builtPages(dir: string): Promise<BuiltPage[]> {
    const pages: BuiltPage[] = [];
    for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.html')) {
            continue;
        }
        const file = join(entry.parentPath, entry.name);
        const name = relative(dir, file).split(sep).join('/');
        const path = name === 'index.html' ? '/' : `/${name.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
        pages.push({ path, html: await readFile(file, 'utf8') });
    }
    return pages;
}

/**
 * Writes `sitemap.xml` after the build, from the pages that were built, so it cannot drift from the routes: it lists a
 * page when its canonical link points at the page itself.
 */
export function sitemap(origin: string): AstroIntegration {
    return {
        name: 'site-kit-sitemap',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                const root = fileURLToPath(dir);
                const pages = await builtPages(root);
                const urls = sitemapUrls(pages, origin);
                await writeFile(join(root, 'sitemap.xml'), sitemapXml(urls));
                logger.info(`sitemap.xml lists ${urls.length} of ${pages.length} pages`);
            },
        },
    };
}
