/**
 * Daily Affiliate Blog Automation - generates 1 post per run
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const associateTag = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';

    // --- GUARDRAIL: No duplicate topics in 7 days ---
    const recentPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 50);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentTitles = recentPosts
      .filter(p => p.created_date >= sevenDaysAgo)
      .map(p => p.title)
      .filter(Boolean)
      .slice(0, 20)
      .join(', ') || 'none yet';

    const existingSlugs = new Set(recentPosts.map(p => p.slug));

    const CATEGORIES = [
      "Best Products", "Amazon Finds", "Home Organization",
      "Fitness Gear", "Tech Accessories", "Deals Under $50", "Product Reviews"
    ];

    // --- STEP 1: Pick one trending topic ---
    const trendResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an Amazon affiliate content strategist for DanFinds.com.

Find 1 hot trending Amazon product topic RIGHT NOW (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}) for an affiliate blog post.

AVOID topics similar to these recent posts: ${recentTitles}

Requirements:
- High buyer intent ("best X for Y", "top X under $50", "X review 2026")
- One of these categories: ${CATEGORIES.join(', ')}
- Trending on Amazon, TikTok, seasonal, or high search volume
- Prefer under $100 price points

Return JSON with a single topic object.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          keyword: { type: "string" },
          category: { type: "string" },
          trend_reason: { type: "string" }
        }
      }
    });

    const topic = trendResult;
    if (!topic?.keyword) {
      return Response.json({ success: false, message: 'No trending topic found' });
    }

    // --- STEP 2: Generate the full blog post ---
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an expert Amazon affiliate blog writer for DanFinds.com.

Write a complete SEO-optimized blog post about: "${topic.keyword}"
Category: "${topic.category}"
Trend context: ${topic.trend_reason}
Amazon Associate Tag: ${associateTag}

Search Amazon for 4-5 REAL, currently available, highly-rated products for this topic.
For each product:
- Use the real ASIN (format: B0XXXXXXXXX)
- Use real current price
- Use real Amazon customer rating (typically 4.0–4.9)
- Image URL format: https://m.media-amazon.com/images/I/IMAGEID._AC_SL500_.jpg
- Affiliate link: https://www.amazon.com/dp/ASIN?tag=${associateTag}

Write 1200–1600 words. Conversational, helpful, honest tone. Not salesy.
The featured_image should be the best product's image URL.

Return complete blog post JSON.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          excerpt: { type: "string" },
          featured_image: { type: "string" },
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

    // Ensure unique slug
    let slug = result.slug ||
      topic.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (existingSlugs.has(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    const blogPost = await base44.asServiceRole.entities.BlogPost.create({
      title: result.title || topic.keyword,
      slug,
      category: topic.category,
      excerpt: result.excerpt || '',
      introduction: result.introduction || '',
      buying_guide: result.buying_guide || '',
      conclusion: result.conclusion || '',
      meta_title: result.meta_title || result.title || '',
      meta_description: result.meta_description || result.excerpt || '',
      tags: result.tags || [topic.keyword],
      read_time: result.read_time || 8,
      featured_image: result.featured_image || result.products?.[0]?.image || '',
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