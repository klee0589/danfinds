/**
 * Stage 3 Publishing Engine
 * Takes generated post data + products → saves to BlogPost entity + updates PublishQueue
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { postData, queueId, featuredImage } = await req.json();
    if (!postData?.title || !postData?.slug) {
      return Response.json({ error: 'postData with title and slug required' }, { status: 400 });
    }

    // Save to BlogPost entity
    const blogPost = await base44.asServiceRole.entities.BlogPost.create({
      ...postData,
      featured_image: featuredImage || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80`,
      author: "Dan",
      author_bio: "Dan is an Amazon deal hunter and product researcher who has reviewed thousands of products since 2018.",
      author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      is_featured: false,
      views: 0
    });

    // Update publish queue if provided
    if (queueId) {
      await base44.asServiceRole.entities.PublishQueue.update(queueId, {
        approval_status: "published",
        blog_post_id: blogPost.id,
        post_slug: blogPost.slug,
        published_at: new Date().toISOString()
      });
    }

    return Response.json({ success: true, blog_post: blogPost });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});