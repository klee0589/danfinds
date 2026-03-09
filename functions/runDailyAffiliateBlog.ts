/**
 * Daily Affiliate Blog Automation
 * Discovers trending products, generates 5 full articles, publishes to site.
 * Called by scheduled automation - no user auth required.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const associateTag = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';

    // --- GUARDRAIL: Max 5 posts/day ---
    const today = new Date().toISOString().split('T')[0];
    const recentPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
    const todaysPosts = recentPosts.filter(p => p.created_date?.startsWith(today));

    if (todaysPosts.length >= 5) {
      return Response.json({ success: true, message: 'Max 5 posts/day already reached', count: 5 });
    }

    const postsToCreate = 5 - todaysPosts.length;

    // --- GUARDRAIL: No duplicate topics in 7 days ---
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

    // --- STEP 1: Discover trending topics ---
    const trendResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an Amazon affiliate content strategist for DanFinds.com.

Find ${postsToCreate + 3} hot trending Amazon product topics RIGHT NOW (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}) for affiliate blog posts.

AVOID topics similar to these recent posts: ${recentTitles}

Requirements:
- High buyer intent ("best X for Y", "top X under $50", "X review 2026")
- Vary across these categories: ${CATEGORIES.join(', ')}
- Trending on Amazon, TikTok, seasonal, or high search volume
- Prefer under $100 price points
- Products with many Amazon listings to choose from

Return JSON with topics array.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                category: { type: "string" },
                trend_reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    const topics = (trendResult.topics || []).slice(0, postsToCreate);

    if (topics.length === 0) {
      return Response.json({ success: false, message: 'No trending topics found' });
    }

    const publishedPosts = [];

    // --- STEP 2: Generate full article per topic with real Amazon products ---
    for (const topic of topics) {
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

      // --- Re-upload Amazon images to avoid hotlink blocking ---
      async function reuploadImage(url) {
        if (!url) return null;
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

      // Re-upload all product images
      if (result.products?.length) {
        for (const product of result.products) {
          if (product.image) {
            const newUrl = await reuploadImage(product.image);
            if (newUrl) product.image = newUrl;
          }
        }
      }

      // Re-upload featured image
      if (result.featured_image) {
        const newFeatured = await reuploadImage(result.featured_image);
        if (newFeatured) result.featured_image = newFeatured;
      }

      // Ensure unique slug
      let slug = result.slug ||
        topic.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${new Date().getFullYear()}`;
      }
      existingSlugs.add(slug);

      const featuredImage =
        result.featured_image ||
        result.products?.[0]?.image ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

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
        featured_image: featuredImage,
        products: result.products || [],
        faqs: result.faqs || [],
        author: 'Dan',
        author_bio: 'Dan is an Amazon deal hunter and product researcher who has reviewed thousands of products since 2018.',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        is_featured: false,
        views: 0
      });

      publishedPosts.push({ id: blogPost.id, title: blogPost.title, slug: blogPost.slug });
    }

    return Response.json({
      success: true,
      posts_created: publishedPosts.length,
      posts: publishedPosts
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});