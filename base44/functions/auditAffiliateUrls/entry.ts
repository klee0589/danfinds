/**
 * Audits all affiliate URLs across BlogPost products.
 * Finds /dp/ links with suspicious/placeholder ASINs and
 * optionally rewrites them to search URLs.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASSOCIATE_TAG = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';

// Amazon ASINs are exactly 10 alphanumeric chars starting with B or a digit
function isLikelyValidAsin(asin) {
  return /^[B0-9][A-Z0-9]{9}$/.test(asin);
}

function extractAsin(url) {
  const m = url.match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const fix = body.fix === true; // pass fix: true to actually rewrite bad /dp/ links

  // Fetch ALL posts
  let posts = [];
  let page = 0;
  const pageSize = 100;
  while (true) {
    const batch = await base44.asServiceRole.entities.BlogPost.list('-created_date', pageSize, page * pageSize);
    if (!batch || batch.length === 0) break;
    posts = posts.concat(batch);
    if (batch.length < pageSize) break;
    page++;
  }

  const suspicious = [];
  const updatePromises = [];

  for (const post of posts) {
    const products = post.products || [];
    let changed = false;

    const updatedProducts = products.map(p => {
      const url = p.affiliate_url || '';

      if (url.includes('/dp/')) {
        const asin = extractAsin(url);
        if (!asin || !isLikelyValidAsin(asin)) {
          suspicious.push({ post: post.slug, product: p.name, url, asin: asin || 'NONE', reason: 'Invalid ASIN format' });
          if (fix) {
            const q = encodeURIComponent((p.name || '').trim());
            changed = true;
            return { ...p, affiliate_url: `https://www.amazon.com/s?k=${q}&tag=${ASSOCIATE_TAG}&linkCode=ur2` };
          }
        }
      } else if (url.includes('/s?')) {
        // Check search URLs for bad k= values
        try {
          const u = new URL(url);
          const k = decodeURIComponent(u.searchParams.get('k') || '');
          // Flag if k is empty, too short, or looks like a placeholder
          if (!k || k.length < 5 || k.toLowerCase().includes('product name') || k.toLowerCase().includes('placeholder')) {
            suspicious.push({ post: post.slug, product: p.name, url, k, reason: 'Bad search term' });
            if (fix && p.name) {
              const q = encodeURIComponent(p.name.trim());
              changed = true;
              return { ...p, affiliate_url: `https://www.amazon.com/s?k=${q}&tag=${ASSOCIATE_TAG}&linkCode=ur2` };
            }
          }
        } catch { /* ignore */ }
      } else if (!url) {
        // Missing URL entirely
        suspicious.push({ post: post.slug, product: p.name, url: 'EMPTY', reason: 'No URL' });
      }

      return p;
    });

    if (fix && changed) {
      updatePromises.push(
        base44.asServiceRole.entities.BlogPost.update(post.id, { products: updatedProducts })
      );
    }
  }

  if (fix && updatePromises.length > 0) {
    const batchSize = 20;
    for (let i = 0; i < updatePromises.length; i += batchSize) {
      await Promise.all(updatePromises.slice(i, i + batchSize));
    }
  }

  return Response.json({
    totalPosts: posts.length,
    suspiciousCount: suspicious.length,
    fixed: fix ? suspicious.length : 0,
    suspicious: suspicious.slice(0, 50), // return up to 50 examples
    message: fix ? `Rewrote ${suspicious.length} bad /dp/ links to search URLs` : 'Dry run — pass fix: true to rewrite'
  });
});