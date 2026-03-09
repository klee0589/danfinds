/**
 * One-time fix: regenerate images for all existing BlogPost records using AI
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    async function generateImg(prompt) {
      try {
        const res = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });
        return res.url || null;
      } catch { return null; }
    }

    const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
    const results = [];

    for (const post of posts) {
      const updates = {};

      // Fix featured_image if it's an Amazon URL
      if (post.featured_image?.includes('m.media-amazon.com') || !post.featured_image) {
        const newUrl = await generateImg(
          `Professional product photo for a blog post about: ${post.title}. Clean white background, high quality Amazon-style photography.`
        );
        if (newUrl) updates.featured_image = newUrl;
      }

      // Fix product images
      if (post.products?.length) {
        const fixedProducts = [];
        for (const product of post.products) {
          if (product.image?.includes('m.media-amazon.com') || !product.image) {
            const newUrl = await generateImg(
              `Professional Amazon-style product photo of: ${product.name}. Clean white background, high quality.`
            );
            fixedProducts.push({ ...product, image: newUrl || product.image });
          } else {
            fixedProducts.push(product);
          }
        }
        updates.products = fixedProducts;
      }

      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.BlogPost.update(post.id, updates);
        results.push({ title: post.title, fixed: true });
      } else {
        results.push({ title: post.title, fixed: false });
      }
    }

    return Response.json({ success: true, total: posts.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});