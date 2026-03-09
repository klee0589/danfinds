/**
 * Fixes all BlogPosts that have products with missing images.
 * Asks LLM for a real Amazon image URL per product, then re-hosts it.
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

    const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 200);
    const postsNeedingFix = posts.filter(p =>
      p.products?.some(prod => !prod.image)
    );

    let fixed = 0;
    let failed = 0;

    for (const post of postsNeedingFix) {
      const products = [...(post.products || [])];
      let changed = false;

      for (let i = 0; i < products.length; i++) {
        if (products[i].image) continue;

        // Ask LLM for a real Amazon image URL
        try {
          const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Find a real Amazon product image URL for: "${products[i].name}".
Return ONLY a valid image URL from m.media-amazon.com in this exact format:
https://m.media-amazon.com/images/I/IMAGEID._AC_SL500_.jpg`,
            add_context_from_internet: true,
            model: 'gemini_3_flash',
            response_json_schema: {
              type: "object",
              properties: { image_url: { type: "string" } }
            }
          });

          const imageUrl = llmResult.image_url;
          if (imageUrl) {
            const imgRes = await fetch(imageUrl);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
              if (uploaded.file_url) {
                products[i] = { ...products[i], image: uploaded.file_url };
                changed = true;
                fixed++;
              }
            }
          }
        } catch {
          failed++;
        }
      }

      if (changed) {
        await base44.asServiceRole.entities.BlogPost.update(post.id, { products });
      }
    }

    return Response.json({
      success: true,
      posts_checked: postsNeedingFix.length,
      images_fixed: fixed,
      images_failed: failed
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});