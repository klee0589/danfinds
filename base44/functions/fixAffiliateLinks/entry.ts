import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tag = 'danfindsapp11-20';
    const posts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 200);
    let updatedCount = 0;

    for (const post of posts) {
        if (!post.products || post.products.length === 0) continue;

        let changed = false;
        const updatedProducts = post.products.map(product => {
            // Check if it's a direct ASIN link (fake) or already a search link
            if (product.affiliate_url && product.affiliate_url.includes('/dp/')) {
                const searchQuery = encodeURIComponent(product.name || '');
                const newUrl = `https://www.amazon.com/s?k=${searchQuery}&tag=${tag}`;
                changed = true;
                return { ...product, affiliate_url: newUrl };
            }
            return product;
        });

        if (changed) {
            await base44.asServiceRole.entities.BlogPost.update(post.id, { products: updatedProducts });
            updatedCount++;
        }
    }

    return Response.json({ success: true, updated_posts: updatedCount, total_posts: posts.length });
});