/**
 * Stage 3: AI-powered blog post generator
 * Takes a keyword + array of products → generates a full BlogPost via LLM
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { keyword, category, products } = await req.json();
    if (!keyword || !products?.length) {
      return Response.json({ error: 'keyword and products are required' }, { status: 400 });
    }

    const productSummaries = products.map((p, i) =>
      `${i + 1}. ${p.title} — $${p.price_snapshot || 'N/A'} | Rating: ${p.rating || 'N/A'} | ASIN: ${p.asin || 'N/A'} | Best for: ${p.best_for || 'General use'}`
    ).join('\n');

    const prompt = `You are an expert Amazon affiliate blog writer. Generate a complete, SEO-optimized blog post for DanFinds.

KEYWORD/TOPIC: "${keyword}"
CATEGORY: ${category}
ASSOCIATE TAG: danfindsapp11-20

PRODUCTS TO REVIEW:
${productSummaries}

Generate a JSON object with this exact structure:
{
  "title": "Best [keyword] (2026): Top X Picks Reviewed",
  "slug": "best-[keyword-hyphenated]",
  "excerpt": "2-3 sentence compelling excerpt with buyer intent",
  "introduction": "2-3 paragraph engaging introduction (markdown)",
  "buying_guide": "Comprehensive buying guide with **bold headers** for key factors (markdown)",
  "conclusion": "Strong 1-2 paragraph conclusion recommending the top pick",
  "meta_title": "SEO optimized title under 60 chars",
  "meta_description": "SEO meta description 150-160 chars with keyword",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "read_time": 10,
  "faqs": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "products": [
    {
      "name": "product name",
      "summary": "2 sentence compelling summary",
      "price_range": "$X–$Y",
      "rating": 4.5,
      "best_for": "specific use case",
      "pros": ["pro1", "pro2", "pro3"],
      "cons": ["con1", "con2"],
      "key_features": ["feature1", "feature2", "feature3"],
      "affiliate_url": "https://www.amazon.com/s?k=PRODUCT+NAME+SEARCH&tag=danfindsapp11-20"
    }
  ]
}

IMPORTANT: 
- ALWAYS use search URL format for affiliate_url: https://www.amazon.com/s?k=PRODUCT+NAME&tag=danfindsapp11-20
- Replace spaces with + in the search query. Never use /dp/ASIN links as ASINs may be invalid.
- Write naturally and helpfully, not salesy
- Include real product specs if known
- The buying guide should have at least 4 key factors`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
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
          faqs: { type: "array", items: { type: "object" } },
          products: { type: "array", items: { type: "object" } }
        }
      }
    });

    return Response.json({ success: true, post: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});