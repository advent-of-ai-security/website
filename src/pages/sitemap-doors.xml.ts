import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { startOfDayUTC, slugCollator } from '@/utils/dates';

export const prerender = false;

export const GET: APIRoute = async ({ site, url }) => {
  const entries = await getCollection('doors');
  const today = startOfDayUTC(new Date());

  const doors = entries
    .filter((e) => e.data.date instanceof Date)
    .map((e) => ({ slug: e.slug, date: e.data.date as Date }))
    .filter((e) => startOfDayUTC(e.date) <= today)
    .sort((a, b) => slugCollator.compare(a.slug, b.slug));

  const base = site ?? new URL('/', url);

  const urls = doors
    .map((d) => {
      const loc = new URL(`/doors/${d.slug}`, base).toString();
      const lastmod = d.date.toISOString();
      return `\n  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>never</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

