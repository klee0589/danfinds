/**
 * One-time fix: re-upload all Amazon images in existing BlogPost records to Base44 CDN
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function reuploadImage(url, base44) {
  if (!url || !url.includes('m.media-amazon.com')) return null;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const blob = await res.blob();
    const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
    return uploaded.file_url || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
    const results = [];

    for (const post of posts) {
      let changed = false;
      const updates = {};

      // Fix featured_image
      if (post.featured_image?.includes('m.media-amazon.com')) {
        const newUrl = await reuploadImage(post.featured_image, base44);
        if (newUrl) {
          updates.featured_image = newUrl;
          changed = true;
        }
      }

      // Fix product images
      if (post.products?.length) {
        const fixedProducts = [];
        for (const product of post.products) {
          if (product.image?.includes('m.media-amazon.com')) {
            const newUrl = await reuploadImage(product.image, base44);
            if (newUrl) {
              fixedProducts.push({ ...product, image: newUrl });
              changed = true;
            } else {
              fixedProducts.push(product);
            }
          } else {
            fixedProducts.push(product);
          }
        }
        if (changed) updates.products = fixedProducts;
      }

      if (changed) {
        await base44.asServiceRole.entities.BlogPost.update(post.id, updates);
        results.push({ id: post.id, title: post.title, fixed: true });
      } else {
        results.push({ id: post.id, title: post.title, fixed: false });
      }
    }

    return Response.json({ success: true, total: posts.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});