/**
 * Fixes all BlogPosts that have products with Amazon CDN images (which get hotlink-blocked).
 * Re-hosts all m.media-amazon.com images via Base44 file storage.
 * Admin only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 3;

    const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 200);

    // Find posts that still have raw Amazon CDN URLs (not yet re-hosted)
    const postsNeedingFix = posts.filter(p =>
      p.products?.some(prod => prod.image && prod.image.includes('m.media-amazon.com'))
      || (p.featured_image && p.featured_image.includes('m.media-amazon.com'))
    );

    const batch = postsNeedingFix.slice(0, limit);
    const remaining = Math.max(0, postsNeedingFix.length - limit);

    let fixed = 0;
    let failed = 0;

    for (const post of batch) {
      const products = [...(post.products || [])];
      let changed = false;

      // Fix product images
      for (let i = 0; i < products.length; i++) {
        const img = products[i].image;
        if (!img || !img.includes('m.media-amazon.com')) continue;

        try {
          const imgRes = await fetch(img, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DanFindsBot/1.0)' }
          });
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
            if (uploaded?.file_url) {
              products[i] = { ...products[i], image: uploaded.file_url };
              changed = true;
              fixed++;
            } else { failed++; }
          } else {
            // Amazon blocked — use picsum fallback
            const seed = encodeURIComponent(products[i].name || `product${i}`).slice(0, 20);
            products[i] = { ...products[i], image: `https://picsum.photos/seed/${seed}/400/300` };
            changed = true;
          }
        } catch {
          failed++;
        }
      }

      // Fix featured_image too
      let featuredImage = post.featured_image;
      if (featuredImage && featuredImage.includes('m.media-amazon.com')) {
        try {
          const imgRes = await fetch(featuredImage, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DanFindsBot/1.0)' }
          });
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
            if (uploaded?.file_url) {
              featuredImage = uploaded.file_url;
              changed = true;
            }
          }
        } catch { /* keep original */ }
      }

      if (changed) {
        await base44.asServiceRole.entities.BlogPost.update(post.id, { products, featured_image: featuredImage });
      }
    }

    return Response.json({
      success: true,
      posts_checked: batch.length,
      images_fixed: fixed,
      images_failed: failed,
      remaining
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});