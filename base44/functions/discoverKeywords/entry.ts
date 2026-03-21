/**
 * Discovers low-competition affiliate SEO keyword opportunities
 * using an LLM to simulate keyword research for specific niches.
 * 
 * Returns 10–20 keyword ideas per call, scored for difficulty/volume/potential.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { niches, count = 15 } = body;

    // Fetch existing keywords to avoid duplication
    const existing = await base44.asServiceRole.entities.KeywordOpportunity.list('-created_date', 200);
    const existingKeywords = new Set(existing.map(k => k.keyword.toLowerCase().trim()));

    // Also fetch existing blog post titles/slugs to avoid overlap
    const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 200);
    const existingTopics = posts.map(p => p.title?.toLowerCase() || '').join('\n');

    const targetNiches = niches || [
      "Apple accessories (MagSafe, AirPods cases, iPad stands, iPhone mounts)",
      "travel tech (portable chargers, travel adapters, luggage trackers, packing cubes)",
      "desk gadgets and desk setup (monitor stands, desk mats, cable management, keyboard accessories)",
      "home organization (drawer organizers, pantry bins, closet systems, small space storage)",
      "kitchen organization (spice racks, drawer dividers, under-sink organizers, countertop organizers)",
      "small apartment gadgets (space-saving furniture, wall-mounted organizers, compact appliances)",
      "cable management (cable boxes, velcro ties, cable sleeves, desk cable trays)",
      "MagSafe accessories (MagSafe wallets, MagSafe car mounts, MagSafe battery packs, MagSafe stands)"
    ];

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      prompt: `You are an expert Amazon affiliate SEO keyword researcher for DanFinds.com.

Your job: Generate ${count} high-quality, low-competition long-tail keyword opportunities for Amazon affiliate content.

Target niches:
${targetNiches.map((n, i) => `${i + 1}. ${n}`).join('\n')}

KEYWORD INTENT PATTERNS (use these patterns, vary them):
- "best [product] for [use case]" 
- "best [product] under $[price]"
- "best [product] for small spaces"
- "best [product] for travel"
- "best [product] for desk setup"  
- "best [product] for [specific user: students / remote workers / minimalists]"
- "how to organize [area] with [product type]"
- "best cheap [product] that [benefit]"
- "[brand] vs [brand] [product]"
- "best [product] [year]"

SELECTION CRITERIA (simulate realistic SEO data):
- Estimated keyword difficulty: 5–25 (easy to rank)
- Monthly search volume: 200–5000
- Strong buyer/commercial intent (someone will click Amazon links)
- Product categories with multiple competing Amazon listings (good for comparison articles)
- Specific enough that DanFinds can rank without a huge domain authority

ALREADY COVERED TOPICS (do NOT suggest these or closely related):
${existingTopics.slice(0, 2000)}

EXISTING KEYWORDS ALREADY IN THE SYSTEM (do NOT duplicate):
${[...existingKeywords].slice(0, 50).join(', ')}

For each keyword, assign:
- category: one of [Best Products, Amazon Finds, Home Organization, Fitness Gear, Tech Accessories, Garage Sale Tools, Deals Under $50, Product Reviews]
- niche: short niche label (e.g. "MagSafe accessories", "cable management")
- intent_type: one of [best_x_for_y, best_x_under_price, how_to_organize, how_to_store, product_review, comparison]
- estimated_difficulty: integer 5–25
- estimated_volume: integer 200–5000
- affiliate_potential: one of [medium, high, very_high]

Return JSON array of keyword objects.`,
      response_json_schema: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                category: { type: "string" },
                niche: { type: "string" },
                intent_type: { type: "string" },
                estimated_difficulty: { type: "number" },
                estimated_volume: { type: "number" },
                affiliate_potential: { type: "string" },
                notes: { type: "string" }
              }
            }
          }
        }
      }
    });

    const keywords = (result.keywords || []).filter(
      k => k.keyword && !existingKeywords.has(k.keyword.toLowerCase().trim())
    );

    // Save all discovered keywords to DB
    const saved = [];
    for (const kw of keywords) {
      const record = await base44.asServiceRole.entities.KeywordOpportunity.create({
        keyword: kw.keyword,
        category: kw.category || 'Best Products',
        niche: kw.niche || '',
        intent_type: kw.intent_type || 'best_x_for_y',
        estimated_difficulty: kw.estimated_difficulty || 15,
        estimated_volume: kw.estimated_volume || 500,
        affiliate_potential: kw.affiliate_potential || 'medium',
        notes: kw.notes || '',
        status: 'discovered'
      });
      saved.push(record);
    }

    return Response.json({
      success: true,
      discovered: saved.length,
      keywords: saved
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});