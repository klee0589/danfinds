/**
 * Generates a single blog post in one LLM call — fast enough to fit within limits.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const associateTag = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';

    const body = await req.json().catch(() => ({}));
    const forceKeyword = body.keyword || null;

    const recentPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 50);
    const existingSlugs = new Set(recentPosts.map(p => p.slug));
    const recentTitles = recentPosts.slice(0, 20).map(p => p.title).filter(Boolean).join(', ') || 'none yet';

    const CATEGORIES = [
      "Best Products", "Amazon Finds", "Home Organization",
      "Fitness Gear", "Tech Accessories", "Deals Under $50", "Product Reviews"
    ];

    const keyword = forceKeyword || null;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an expert Amazon affiliate blog writer for DanFinds.com.

${keyword
  ? `Write a blog post about: "${keyword}"`
  : `First, pick ONE trending Amazon product topic for March 2026 (high buyer intent, diverse from: ${recentTitles}).
Then write the full blog post about that topic.`
}

Available categories: ${CATEGORIES.join(', ')}
Amazon Associate Tag: ${associateTag}

Find 7-9 REAL, highly-rated Amazon products. Assign each a "segment" label that makes sense for the topic — e.g. "Best Budget", "Best Premium", "Best Lightweight", "Best for Beginners", "Best Heavy-Duty", "Best Compact", "Best Smart/Tech", "Best Eco-Friendly", "Best Overall", "Editor's Pick", etc. Use varied, relevant segments — not just price-based. No two products should share the same segment.

For each product:
- Use a real product name
- segment: a short label like "Best Budget", "Best Overall", "Best Lightweight", etc.
- image: use https://picsum.photos/seed/PRODUCTNAME/400/300 (replace PRODUCTNAME with product name slug, no spaces)
- affiliate_url: https://www.amazon.com/s?k=PRODUCT+NAME+HERE&tag=${associateTag} (spaces as +)
- Real-ish price range, rating 4.0–4.9

Write 1200–1600 words. Conversational, helpful, honest tone.

Return complete blog post JSON.`,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          category: { type: "string" },
          excerpt: { type: "string" },
          introduction: { type: "string" },
          buying_guide: { type: "string" },
          conclusion: { type: "string" },
          meta_title: { type: "string" },
          meta_description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          read_time: { type: "number" },
          faqs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                answer: { type: "string" }
              }
            }
          },
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                segment: { type: "string" },
                image: { type: "string" },
                summary: { type: "string" },
                price_range: { type: "string" },
                rating: { type: "number" },
                best_for: { type: "string" },
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
                key_features: { type: "array", items: { type: "string" } },
                affiliate_url: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Fix affiliate URLs
    if (result.products) {
      for (const p of result.products) {
        if (p.affiliate_url && p.affiliate_url.includes('/dp/')) {
          const q = encodeURIComponent(p.name || result.title || 'product');
          p.affiliate_url = `https://www.amazon.com/s?k=${q}&tag=${associateTag}`;
        }
      }
    }

    let slug = result.slug ||
      (result.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (existingSlugs.has(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    const validCategories = [
      "Best Products", "Amazon Finds", "Home Organization",
      "Fitness Gear", "Tech Accessories", "Garage Sale Tools", "Deals Under $50", "Product Reviews"
    ];
    const category = validCategories.includes(result.category) ? result.category : "Amazon Finds";

    const blogPost = await base44.asServiceRole.entities.BlogPost.create({
      title: result.title || slug,
      slug,
      category,
      excerpt: result.excerpt || '',
      introduction: result.introduction || '',
      buying_guide: result.buying_guide || '',
      conclusion: result.conclusion || '',
      meta_title: result.meta_title || result.title || '',
      meta_description: result.meta_description || result.excerpt || '',
      tags: result.tags || [],
      read_time: result.read_time || 7,
      featured_image: result.products?.[0]?.image || '',
      products: result.products || [],
      faqs: result.faqs || [],
      author: 'Dan',
      author_bio: 'Dan is an Amazon deal hunter and product researcher who has reviewed thousands of products since 2018.',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      is_featured: false,
      views: 0
    });

    return Response.json({
      success: true,
      post: { id: blogPost.id, title: blogPost.title, slug: blogPost.slug }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});