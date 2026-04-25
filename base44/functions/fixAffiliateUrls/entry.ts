import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASSOCIATE_TAG = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';

// Validate that a URL looks like a real Amazon product/search URL
function isValidAmazonUrl(url) {
  if (!url) return false;
  if (!url.includes('amazon.com')) return false;
  // Must be a search or product page
  if (!url.includes('/s?') && !url.includes('/dp/') && !url.includes('/gp/')) return false;
  // If it's a search URL, the k= param must not be empty or garbage
  if (url.includes('/s?')) {
    try {
      const u = new URL(url);
      const k = u.searchParams.get('k') || '';
      // Reject if k is too short, empty, or looks like garbage
      if (k.length < 5) return false;
    } catch { return false; }
  }
  return true;
}

// Convert any affiliate URL to a reliable Amazon search URL
// NOTE: /dp/ ASINs are AI-hallucinated and cause 404s — always use search URLs
function buildReliableAffiliateUrl(affiliateUrl, productName) {
  const searchTerm = encodeURIComponent((productName || '').trim());
  if (!searchTerm || searchTerm.length < 3) return null;
  return `https://www.amazon.com/s?k=${searchTerm}&tag=${ASSOCIATE_TAG}&linkCode=ur2`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const dryRun = body.dryRun !== false; // default to dry run for safety

  // Fetch ALL posts in pages
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
  
  let fixed = 0;
  let skipped = 0;
  const changes = [];

  const updatePromises = [];

  for (const post of posts) {
    const products = post.products || [];
    let changed = false;

    const updatedProducts = products.map(p => {
      const url = p.affiliate_url || '';
      
      // Skip only if it's already a proper search URL (linkCode=ur2) — never skip /dp/ links
      if (isValidAmazonUrl(url) && url.includes('linkCode=ur2') && !url.includes('/dp/')) {
        skipped++;
        return p;
      }

      const newUrl = buildReliableAffiliateUrl(url, p.name);
      
      if (newUrl && newUrl !== url) {
        changed = true;
        fixed++;
        if (changes.length < 10) {
          changes.push({ post: post.slug, product: p.name, old: url, new: newUrl });
        }
        return { ...p, affiliate_url: newUrl };
      }
      
      skipped++;
      return p;
    });

    if (changed && !dryRun) {
      updatePromises.push(
        base44.asServiceRole.entities.BlogPost.update(post.id, { products: updatedProducts })
      );
    }
  }

  // Run updates in batches of 20 to avoid timeout
  if (!dryRun && updatePromises.length > 0) {
    const batchSize = 20;
    for (let i = 0; i < updatePromises.length; i += batchSize) {
      await Promise.all(updatePromises.slice(i, i + batchSize));
    }
  }

  return Response.json({ 
    dryRun,
    fixed, 
    skipped, 
    message: dryRun ? 'DRY RUN — pass dryRun: false to apply changes' : `Fixed ${fixed} affiliate URLs`,
    sampleChanges: changes
  });
});