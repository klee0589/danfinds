/**
 * Fix images for a single BlogPost - generates ONE image per call
 * Pass { post_id, type: "featured" } or { post_id, type: "product", product_index: 0 }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { post_id, type, product_index } = await req.json();
    if (!post_id) return Response.json({ error: 'post_id required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(post_id);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const res = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: type === 'product' && post.products?.[product_index]
        ? `Professional Amazon-style product photo of: ${post.products[product_index].name}. Clean white background, high quality.`
        : `Professional product photo for a blog post about: ${post.title}. Clean white background, high quality Amazon-style photography.`
    });

    const newUrl = res.url;
    if (!newUrl) return Response.json({ error: 'Image generation failed' }, { status: 500 });

    if (type === 'product' && product_index !== undefined) {
      const products = [...(post.products || [])];
      products[product_index] = { ...products[product_index], image: newUrl };
      await base44.asServiceRole.entities.BlogPost.update(post_id, { products });
    } else {
      await base44.asServiceRole.entities.BlogPost.update(post_id, { featured_image: newUrl });
    }

    return Response.json({ success: true, url: newUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});