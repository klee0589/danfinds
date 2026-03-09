/**
 * Bulk post generator - creates up to 20 posts
 * Skips image generation for speed; use AdminFixImages to add images after.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const count = Math.min(body.count || 5, 5);
    const associateTag = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';

    const CATEGORIES = [
      "Best Products", "Amazon Finds", "Home Organization",
      "Fitness Gear", "Tech Accessories", "Deals Under $50", "Product Reviews"
    ];

    const existingPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
    const existingSlugs = new Set(existingPosts.map(p => p.slug));
    const recentTitles = existingPosts.slice(0, 30).map(p => p.title).filter(Boolean).join(', ') || 'none yet';

    // Step 1: Generate all topics at once
    const trendResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an Amazon affiliate content strategist for DanFinds.com.

Generate ${count + 5} unique trending Amazon product topics for affiliate blog posts in March 2026.

AVOID topics similar to these existing posts: ${recentTitles}

Requirements:
- High buyer intent ("best X for Y", "top X under $50", "X review 2026")
- Spread evenly across: ${CATEGORIES.join(', ')}
- Trending, seasonal, or high search volume
- Price points under $100 preferred
- Diverse topics, no overlap

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

    const topics = (trendResult.topics || []).slice(0, count);
    if (topics.length === 0) {
      return Response.json({ success: false, message: 'No topics found' });
    }

    const publishedPosts = [];

    // Step 2: Generate each post sequentially
    for (const topic of topics) {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an expert Amazon affiliate blog writer for DanFinds.com.

Write a complete SEO-optimized blog post about: "${topic.keyword}"
Category: "${topic.category}"
Context: ${topic.trend_reason}
Amazon Associate Tag: ${associateTag}

Find 4-5 real, highly-rated products available on Amazon for this topic.
Write 1200–1600 words. Conversational, helpful, honest tone.

CRITICAL: For affiliate_url, ALWAYS use Amazon search format:
https://www.amazon.com/s?k=PRODUCT+NAME+HERE&tag=${associateTag}
Replace spaces with + signs. NEVER use /dp/ASIN links.

Return complete blog post JSON.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            slug: { type: "string" },
            excerpt: { type: "string" },
            introduction: { type: "string" },
            buying_guide: { type: "string" },
            conclusion: { type: "string" },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            read_time: { type: "number" },
            faqs: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } },
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  summary: { type: "string" },
                  price_range: { type: "string" },
                  rating: { type: "number" },
                  best_for: { type: "string" },
                  pros: { type: "array", items: { type: "string" } },
                  cons: { type: "array", items: { type: "string" } },
                  key_features: { type: "array", items: { type: "string" } },
                  affiliate_url: { type: "string" },
                  image: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Fix any /dp/ links that snuck through, and re-host product images
      if (result.products) {
        for (const product of result.products) {
          if (product.affiliate_url && product.affiliate_url.includes('/dp/')) {
            const q = encodeURIComponent(product.name || topic.keyword);
            product.affiliate_url = `https://www.amazon.com/s?k=${q}&tag=${associateTag}`;
          }
          // Fetch and re-upload Amazon image to app storage
          if (product.image) {
            try {
              const imgRes = await fetch(product.image);
              if (imgRes.ok) {
                const blob = await imgRes.blob();
                const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
                product.image = uploaded.file_url || '';
              } else {
                product.image = '';
              }
            } catch {
              product.image = '';
            }
          }
        }
      }

      // Ensure unique slug
      let slug = result.slug ||
        topic.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${Date.now()}`;
      }
      existingSlugs.add(slug);

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
        featured_image: '',
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
      message: `Created ${publishedPosts.length} posts. Visit AdminFixImages to add images.`,
      posts: publishedPosts
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});