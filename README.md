# astro-site-kit

The invisible parts shared by the Astro sites of the same author. MIT licensed.

## Inside

- `src/seo.ts`: `fitTitle`, `textOf`, `clip`, `describe`, `sitemapUrls`, `sitemapXml`, and the length limits.
- `src/sitemap.ts`: `sitemap(origin)`, an Astro integration that writes `sitemap.xml` after the build from the pages that were built.
- `src/Head.astro`: the `<head>` children (title, description, canonical, Open Graph, Twitter card, favicon). Put it inside your own `<head>`.
- `scripts/og-image.mjs`: `node og-image.mjs <input.html> <output.png>` draws a 1200x630 share card (honours `PW_CHROMIUM_PATH`).
- `tsconfig.base.json`, `vitest.base.ts` (`kitVitest(include)`), `playwright.base.ts` (`kitPlaywright({ port, testDir })`): base configs to extend.

## Invisible only

The kit holds nothing a visitor can see: no CSS, fonts, colours or visible markup. Every site keeps its own look.

## Using it in a site

```sh
git submodule add <url> vendors/site-kit
```

Alias it in the site's Vite config:

```ts
// astro.config.ts
import { fileURLToPath } from 'node:url';

export default defineConfig({
    vite: { resolve: { alias: { '@kit': fileURLToPath(new URL('./vendors/site-kit/src', import.meta.url)) } } },
});
```

Then `import Head from '@kit/Head.astro'` and `import { sitemap } from '@kit/sitemap.ts'`.

## Tests

```sh
npm install
npm test
```
