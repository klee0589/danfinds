/**
 * Fix images for a single BlogPost by ID (call once per post)
 * Pass { post_id: "..." } or omit to get a list of posts needing fixes
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { post_id } = await req.json().catch(() => ({}));

    async function generateImg(prompt) {
      const res = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });
      return res.url || null;
    }

    // If no post_id, return list of posts with broken images
    if (!post_id) {
      const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
      const broken = posts
        .filter(p => p.featured_image?.includes('m.media-amazon.com') || !p.featured_image)
        .map(p => ({ id: p.id, title: p.title }));
      return Response.json({ posts_needing_fix: broken });
    }

    const post = await base44.asServiceRole.entities.BlogPost.get(post_id);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const updates = {};

    // Fix featured_image
    if (post.featured_image?.includes('m.media-amazon.com') || !post.featured_image) {
      updates.featured_image = await generateImg(
        `Professional product photo for a blog post about: ${post.title}. Clean white background, high quality Amazon-style photography.`
      );
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

    await base44.asServiceRole.entities.BlogPost.update(post.id, updates);

    return Response.json({ success: true, post_id, title: post.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});