/**
 * Generates a dynamic sitemap.xml for Google Search Console
 * Lists all published blog posts
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all published blog posts
    const posts = await base44.asServiceRole.entities.BlogPost.list('-updated_date', 500);

    // Use custom domain
    const baseUrl = 'https://danfinds.online';

    // Build sitemap XML
    const sitemapEntries = posts
      .filter(post => post.slug) // Only include posts with slugs
      .map(post => {
        const loc = `${baseUrl}/blog/${post.slug}`;
        const lastmod = post.updated_date ? new Date(post.updated_date).toISOString().split('T')[0] : '';
        return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('\n');

    // Add main pages
    const mainPages = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/Blog`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/Categories`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/Newsletter`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/About`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/Contact`, priority: '0.7', changefreq: 'monthly' }
    ];

    const mainPageEntries = mainPages
      .map(page => `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
      .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${mainPageEntries}
${sitemapEntries}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}