/**
 * Rewrites meta_title + meta_description for specific blog post slugs
 * using LLM to improve CTR based on Search Console data.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REWRITES = [
  {
    slug: "5-best-smart-jump-ropes-fitness-goals-2026",
    impressions: 271,
    position: 8.7,
    direction: "High impressions, zero clicks. Rewrite to be specific, benefit-driven, curiosity-triggering. Angle: tested comparison by calories burned, accuracy & price. Must feel like a real tester wrote it, not a content farm."
  },
  {
    slug: "best-ergonomic-vertical-mice-under-45",
    impressions: 70,
    position: 11,
    direction: "Emphasize the under-$45 price angle and wrist pain relief benefit. Make it feel urgent and specific."
  },
  {
    slug: "best-portable-power-banks-built-in-cables-spring-travel-2026",
    impressions: 59,
    position: 15,
    direction: "Lean into the built-in cable differentiator — this is the unique angle. Target travelers who hate carrying cables. Make the title feel like a solved problem."
  },
  {
    slug: "5-best-solar-motion-sensor-outdoor-lights-spring-2026",
    impressions: 47,
    position: 10.8,
    direction: "Lead with the security/safety benefit, not just 'solar lights'. Add a differentiator like brightness (lumens) or install-time."
  },
  {
    slug: "best-solar-motion-security-lights-under-55-2026",
    impressions: 44,
    position: 18.8,
    direction: "Very low CTR at pos 18. Make the title feel like a curated shortlist, not just another listicle. Emphasize value under $55 and no-wiring install."
  },
  {
    slug: "best-over-the-door-pantry-organizers-2026",
    impressions: 26,
    position: 9.3,
    direction: "Target the 'small kitchen' or 'renter-friendly' angle. Emphasize zero drilling, instant upgrade."
  },
  {
    slug: "best-self-watering-indoor-herb-garden-kits-under-50",
    impressions: 16,
    position: 7.3,
    direction: "Position 7.3 is close to page 1. Title needs to feel personal and tested. Emphasize 'even if you kill every plant' angle or beginner-friendly."
  },
  {
    slug: "top-under-sink-pull-out-organizers-bathroom-2026",
    impressions: 11,
    position: 11.2,
    direction: "Lead with the 'stop wasting cabinet space' hook. Make it feel like a quick fix for a common frustration."
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const slugsToProcess = body.slugs || REWRITES.map(r => r.slug);

    const results = [];
    const errors = [];

    for (const slug of slugsToProcess) {
      const rewriteConfig = REWRITES.find(r => r.slug === slug);

      // Find the post
      const posts = await base44.asServiceRole.entities.BlogPost.filter({ slug });
      if (!posts || posts.length === 0) {
        errors.push({ slug, error: 'Post not found' });
        continue;
      }
      const post = posts[0];

      const direction = rewriteConfig?.direction || 'Rewrite to be more specific, benefit-driven, and curiosity-triggering.';
      const impressions = rewriteConfig?.impressions || 'unknown';
      const position = rewriteConfig?.position || 'unknown';

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an expert SEO copywriter for DanFinds, an Amazon product review blog.

Current post:
- Title: "${post.title}"
- Current meta_title: "${post.meta_title || post.title}"
- Current meta_description: "${post.meta_description || post.excerpt}"
- Slug: ${slug}
- Search Console data: ${impressions} impressions, ${position} avg position, 0 clicks (CTR = 0%)

Direction: ${direction}

Rules:
1. meta_title: 50-60 characters. Specific, benefit-driven, no clickbait. Include year (2026) if relevant. Avoid "5 Best X" — use a differentiator.
2. meta_description: 145-158 characters exactly. Must include a reason to click — benefit + hook. No "In this article..." openings. Sound like a human who tested these.
3. Do NOT change the slug or post title (that's separate).
4. The site is DanFinds.online — honest Amazon product reviews.

Return JSON with: meta_title (string), meta_description (string), reasoning (string, 1 sentence why this will improve CTR)`,
        response_json_schema: {
          type: "object",
          properties: {
            meta_title: { type: "string" },
            meta_description: { type: "string" },
            reasoning: { type: "string" }
          }
        }
      });

      await base44.asServiceRole.entities.BlogPost.update(post.id, {
        meta_title: result.meta_title,
        meta_description: result.meta_description
      });

      results.push({
        slug,
        old_meta_title: post.meta_title || post.title,
        new_meta_title: result.meta_title,
        old_meta_description: post.meta_description || post.excerpt,
        new_meta_description: result.meta_description,
        reasoning: result.reasoning
      });
    }

    return Response.json({ success: true, updated: results.length, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});