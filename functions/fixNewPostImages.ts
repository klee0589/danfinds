/**
 * Auto-fixes missing images on newly created BlogPosts.
 * Called by entity automation on BlogPost create.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const post_id = body?.event?.entity_id || body?.data?.id;
    if (!post_id) return Response.json({ error: 'No post_id in payload' }, { status: 400 });

    // Wait a moment for the post to be fully saved
    await new Promise(r => setTimeout(r, 2000));

    const post = await base44.asServiceRole.entities.BlogPost.get(post_id);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const products = [...(post.products || [])];
    let fixed = 0;
    let failed = 0;
    let changed = false;

    for (let i = 0; i < products.length; i++) {
      if (products[i].image) continue; // already has an image

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
            if (uploaded?.file_url) {
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
      await base44.asServiceRole.entities.BlogPost.update(post_id, { products });
    }

    return Response.json({ success: true, post_id, images_fixed: fixed, images_failed: failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});