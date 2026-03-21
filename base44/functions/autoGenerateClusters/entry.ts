/**
 * Auto-generates up to 2 content clusters per day from approved keywords.
 * Designed to be triggered by a scheduled automation (once daily).
 * 
 * Flow:
 *  1. Find up to 2 keywords with status="queued", ordered by estimated_volume desc
 *  2. For each, invoke generateCluster and mark the keyword as completed
 *  3. Return a summary of what was generated
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This can be called by automation (no user) or by admin manually
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_) {
      // Called from automation — use service role
    }

    // Pick up to 2 queued keywords sorted by volume (highest first)
    const allQueued = await base44.asServiceRole.entities.KeywordOpportunity.filter(
      { status: 'queued' }, '-estimated_volume', 10
    );

    const toProcess = allQueued.slice(0, 2);

    if (toProcess.length === 0) {
      return Response.json({ success: true, message: 'No queued keywords to process.', generated: [] });
    }

    const generated = [];
    const errors = [];

    for (const kw of toProcess) {
      // Mark as generating
      await base44.asServiceRole.entities.KeywordOpportunity.update(kw.id, { status: 'generating' });

      try {
        // Invoke generateCluster as service role via internal SDK call
        const clusterRes = await base44.asServiceRole.functions.invoke('generateCluster', {
          keyword: kw.keyword,
          category: kw.category || 'Best Products',
          _service_call: true
        });

        if (clusterRes?.success) {
          const cluster = clusterRes.cluster;
          const allSlugs = [
            cluster.list?.slug,
            cluster.guide?.slug,
            ...(cluster.reviews || []).map(r => r.slug)
          ].filter(Boolean);

          await base44.asServiceRole.entities.KeywordOpportunity.update(kw.id, {
            status: 'completed',
            cluster_id: cluster.list?.id || '',
            cluster_slugs: allSlugs,
            generated_at: new Date().toISOString()
          });

          generated.push({
            keyword: kw.keyword,
            articles: allSlugs.length,
            list_slug: cluster.list?.slug,
            guide_slug: cluster.guide?.slug,
            review_slugs: (cluster.reviews || []).map(r => r.slug)
          });
        } else {
          throw new Error(clusterRes?.error || 'generateCluster returned no success');
        }

      } catch (err) {
        await base44.asServiceRole.entities.KeywordOpportunity.update(kw.id, { status: 'queued', notes: `Error: ${err.message}` });
        errors.push({ keyword: kw.keyword, error: err.message });
      }
    }

    return Response.json({
      success: true,
      processed: toProcess.length,
      generated,
      errors
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});