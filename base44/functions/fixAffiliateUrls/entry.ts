import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASSOCIATE_TAG = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';

// Convert any affiliate URL to a reliable Amazon search URL
function buildReliableAffiliateUrl(affiliateUrl, productName) {
  // Already a direct /dp/ link — keep as-is
  if (affiliateUrl && affiliateUrl.includes('/dp/')) {
    // Ensure tag is present
    const url = new URL(affiliateUrl);
    url.searchParams.set('tag', ASSOCIATE_TAG);
    return url.toString();
  }

  // Build a clean search URL from product name
  const searchTerm = encodeURIComponent(productName.trim());
  return `https://www.amazon.com/s?k=${searchTerm}&tag=${ASSOCIATE_TAG}&linkCode=ur2`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const dryRun = body.dryRun !== false; // default to dry run for safety

  const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 200);
  
  let fixed = 0;
  let skipped = 0;
  const changes = [];

  const updatePromises = [];

  for (const post of posts) {
    const products = post.products || [];
    let changed = false;

    const updatedProducts = products.map(p => {
      const url = p.affiliate_url || '';
      
      // Only fix search-style URLs that aren't /dp/ links and don't already have linkCode
      if (url.includes('/dp/') || url.includes('linkCode=ur2')) {
        skipped++;
        return p;
      }

      const newUrl = buildReliableAffiliateUrl(url, p.name);
      
      if (newUrl !== url) {
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