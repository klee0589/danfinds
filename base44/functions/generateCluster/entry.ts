/**
 * Generates a full SEO content cluster for a given keyword:
 *   - 1 Product List article (5–7 products, comparison style)
 *   - 1 Buying Guide (informational, 1200–1800 words)
 *   - 5 Individual Product Review articles (800–1200 words each)
 *
 * All articles interlink naturally to form a topic cluster.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const VALID_CATEGORIES = [
  "Best Products", "Amazon Finds", "Home Organization",
  "Fitness Gear", "Tech Accessories", "Garage Sale Tools", "Deals Under $50", "Product Reviews"
];

function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function ensureUniqueSlug(slug, existingSlugs) {
  if (!existingSlugs.has(slug)) return slug;
  return `${slug}-${Date.now()}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { keyword, category } = body;

    if (!keyword) {
      return Response.json({ error: 'keyword is required' }, { status: 400 });
    }

    const associateTag = Deno.env.get('AMAZON_ASSOCIATE_TAG') || 'danfindsapp11-20';
    const validCategory = VALID_CATEGORIES.includes(category) ? category : 'Best Products';

    // Fetch existing slugs to avoid collisions
    const existing = await base44.asServiceRole.entities.BlogPost.list('-created_date', 200);
    const existingSlugs = new Set(existing.map(p => p.slug));

    const log = [];
    const created = [];

    // ─────────────────────────────────────────────
    // STEP 1: Generate the Product List article
    // ─────────────────────────────────────────────
    log.push('Generating product list article...');

    const listResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      prompt: `You are an expert Amazon affiliate blogger for DanFinds.com.

Write a PRODUCT LIST / COMPARISON article for the keyword: "${keyword}"
Category: ${validCategory}
Amazon Associate Tag: ${associateTag}

Requirements:
- 5–7 real, highly-rated Amazon products (4.0–4.9 stars)
- Each product needs a unique "segment" label (e.g. "Best Budget", "Best Overall", "Best Premium", "Best Lightweight", "Best for Beginners")
- Comparison / "best of" style writing
- 1000–1400 words total
- Mention that full reviews are available for each product (you will link them — use placeholder "[REVIEW_LINK_n]" where n is 1-based product index)
- Affiliate URLs format: https://www.amazon.com/s?k=PRODUCT+NAME&tag=${associateTag}
- Product images: use real Amazon product image URLs in this format: https://m.media-amazon.com/images/I/[realistic-looking-image-id]._AC_SL500_.jpg — OR use https://images-na.ssl-images-amazon.com/images/I/[id]._AC_SL500_.jpg. Pick realistic Amazon image IDs based on the product. If unsure, use the affiliate_url search to infer a likely ASIN and construct: https://m.media-amazon.com/images/I/[ASIN-based-id]._AC_SL500_.jpg. As a fallback ONLY if no real image can be inferred, use: https://via.placeholder.com/400x300?text=PRODUCT+NAME

Return JSON.`,
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

    const listSlug = ensureUniqueSlug(
      listResult.slug || makeSlug(listResult.title || keyword),
      existingSlugs
    );
    existingSlugs.add(listSlug);

    // ─────────────────────────────────────────────
    // STEP 2: Generate slugs for all 5 review articles (so we can interlink)
    // ─────────────────────────────────────────────
    const productNames = (listResult.products || []).slice(0, 5).map(p => p.name);
    const reviewSlugs = productNames.map(name => {
      const s = ensureUniqueSlug(makeSlug(`review-${name}`), existingSlugs);
      existingSlugs.add(s);
      return s;
    });

    const buyingGuideSlug = ensureUniqueSlug(makeSlug(`${keyword}-buying-guide`), existingSlugs);
    existingSlugs.add(buyingGuideSlug);

    // Patch review links into list article content
    const patchReviewLinks = (text) => {
      if (!text) return text;
      let patched = text;
      reviewSlugs.forEach((slug, i) => {
        patched = patched.replace(
          new RegExp(`\\[REVIEW_LINK_${i + 1}\\]`, 'g'),
          `/blog/${slug}`
        );
      });
      return patched;
    };

    const listPost = await base44.asServiceRole.entities.BlogPost.create({
      title: listResult.title || keyword,
      slug: listSlug,
      category: validCategory,
      excerpt: listResult.excerpt || '',
      introduction: patchReviewLinks(listResult.introduction || ''),
      buying_guide: patchReviewLinks(listResult.buying_guide || ''),
      conclusion: patchReviewLinks(listResult.conclusion || ''),
      meta_title: listResult.meta_title || listResult.title || '',
      meta_description: listResult.meta_description || listResult.excerpt || '',
      tags: listResult.tags || [],
      read_time: listResult.read_time || 7,
      featured_image: listResult.products?.[0]?.image || '',
      products: listResult.products || [],
      faqs: listResult.faqs || [],
      author: 'Dan',
      author_bio: 'Dan is an Amazon deal hunter and product researcher who has reviewed thousands of products since 2018.',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      is_featured: false,
      views: 0,
      related_post_slugs: [buyingGuideSlug, ...reviewSlugs]
    });

    created.push({ type: 'list', title: listPost.title, slug: listPost.slug, id: listPost.id });
    log.push(`✓ Product list created: "${listPost.title}"`);

    // ─────────────────────────────────────────────
    // STEP 3: Generate the Buying Guide
    // ─────────────────────────────────────────────
    log.push('Generating buying guide...');

    const guideResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      prompt: `You are an expert content writer for DanFinds.com.

Write a BUYING GUIDE article for the keyword: "${keyword}"
Category: ${validCategory}

Requirements:
- 1200–1800 words
- Purely informational / educational tone
- NO affiliate links in the first half of the article
- Second half can reference the product list article at /blog/${listSlug}
- Covers: what to look for, key features, common mistakes, types/categories, price ranges
- Natural, helpful tone — like advice from a knowledgeable friend
- At the end, include a clear CTA paragraph linking to the product list: "Ready to see our top picks? Check out our full [${listResult.title || keyword}](/blog/${listSlug}) article."

Return JSON with these fields.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          excerpt: { type: "string" },
          introduction: { type: "string" },
          buying_guide: { type: "string" },
          conclusion: { type: "string" },
          meta_title: { type: "string" },
          meta_description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          read_time: { type: "number" },
          faqs: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } }
        }
      }
    });

    const guidePost = await base44.asServiceRole.entities.BlogPost.create({
      title: guideResult.title || `${keyword} — Complete Buying Guide`,
      slug: buyingGuideSlug,
      category: validCategory,
      excerpt: guideResult.excerpt || '',
      introduction: guideResult.introduction || '',
      buying_guide: guideResult.buying_guide || '',
      conclusion: guideResult.conclusion || '',
      meta_title: guideResult.meta_title || guideResult.title || '',
      meta_description: guideResult.meta_description || guideResult.excerpt || '',
      tags: guideResult.tags || [],
      read_time: guideResult.read_time || 8,
      featured_image: listResult.products?.[0]?.image || '',
      products: [],
      faqs: guideResult.faqs || [],
      author: 'Dan',
      author_bio: 'Dan is an Amazon deal hunter and product researcher who has reviewed thousands of products since 2018.',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      is_featured: false,
      views: 0,
      related_post_slugs: [listSlug, ...reviewSlugs.slice(0, 3)]
    });

    created.push({ type: 'guide', title: guidePost.title, slug: guidePost.slug, id: guidePost.id });
    log.push(`✓ Buying guide created: "${guidePost.title}"`);

    // ─────────────────────────────────────────────
    // STEP 4: Generate 5 individual product reviews
    // ─────────────────────────────────────────────
    const reviewPosts = [];

    for (let i = 0; i < productNames.length; i++) {
      const product = listResult.products[i];
      const reviewSlug = reviewSlugs[i];
      log.push(`Generating review ${i + 1}/5: "${product.name}"...`);

      const reviewResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'gemini_3_flash',
        prompt: `You are an expert Amazon product reviewer for DanFinds.com.

Write a deep-dive PRODUCT REVIEW article for: "${product.name}"
Part of the "${keyword}" topic cluster.
Category: ${validCategory}
Amazon Associate Tag: ${associateTag}

Product details:
- Segment: ${product.segment || ''}
- Price range: ${product.price_range || ''}
- Rating: ${product.rating || 4.5}
- Summary: ${product.summary || ''}
- Pros: ${(product.pros || []).join(', ')}
- Cons: ${(product.cons || []).join(', ')}
- Key features: ${(product.key_features || []).join(', ')}
- Best for: ${product.best_for || ''}
- Affiliate URL: ${product.affiliate_url || ''}

Requirements:
- 800–1200 words
- Deep dive on this one product only
- Sections: Overview, Key Features, Pros & Cons, Who Should Buy, Who Should Avoid, Verdict
- "Who Should Buy" section: describe the ideal buyer persona
- Link back to the full list article: "See all our top picks for ${keyword} in our [complete ${keyword} guide](/blog/${listSlug})."
- Affiliate URL already provided above — use it for the "Check price on Amazon" CTA
- Image: ${product.image || `https://picsum.photos/seed/${makeSlug(product.name)}/400/300`}

Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            excerpt: { type: "string" },
            introduction: { type: "string" },
            buying_guide: { type: "string" },
            conclusion: { type: "string" },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            read_time: { type: "number" },
            faqs: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } }
          }
        }
      });

      // Build the review as a single-product BlogPost
      const reviewPost = await base44.asServiceRole.entities.BlogPost.create({
        title: reviewResult.title || `${product.name} Review`,
        slug: reviewSlug,
        category: validCategory,
        excerpt: reviewResult.excerpt || '',
        introduction: reviewResult.introduction || '',
        buying_guide: reviewResult.buying_guide || '',
        conclusion: reviewResult.conclusion || '',
        meta_title: reviewResult.meta_title || reviewResult.title || '',
        meta_description: reviewResult.meta_description || reviewResult.excerpt || '',
        tags: reviewResult.tags || product.name.split(' ').slice(0, 3),
        read_time: reviewResult.read_time || 5,
        featured_image: product.image || '',
        products: [{ ...product, segment: 'Our Pick' }],
        faqs: reviewResult.faqs || [],
        author: 'Dan',
        author_bio: 'Dan is an Amazon deal hunter and product researcher who has reviewed thousands of products since 2018.',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        is_featured: false,
        views: 0,
        related_post_slugs: [listSlug, buyingGuideSlug, ...reviewSlugs.filter((_, j) => j !== i).slice(0, 2)]
      });

      reviewPosts.push(reviewPost);
      created.push({ type: 'review', title: reviewPost.title, slug: reviewPost.slug, id: reviewPost.id });
      log.push(`✓ Review ${i + 1} created: "${reviewPost.title}"`);
    }

    // ─────────────────────────────────────────────
    // STEP 5: Update the list post's related_post_slugs now that we have all review IDs
    // ─────────────────────────────────────────────
    await base44.asServiceRole.entities.BlogPost.update(listPost.id, {
      related_post_slugs: [buyingGuideSlug, ...reviewSlugs]
    });

    log.push('✓ All interlinks updated.');
    log.push(`🎉 Cluster complete! Created ${created.length} articles.`);

    return Response.json({
      success: true,
      cluster: {
        keyword,
        list: created.find(c => c.type === 'list'),
        guide: created.find(c => c.type === 'guide'),
        reviews: created.filter(c => c.type === 'review')
      },
      log
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});