import { useMemo } from "react";
import { Clock, AlertCircle, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SAMPLE_POSTS } from "../components/blog/blogData";
import Breadcrumb from "../components/blog/Breadcrumb";
import TableOfContents from "../components/blog/TableOfContents";
import ComparisonTable from "../components/blog/ComparisonTable";
import ProductCard from "../components/blog/ProductCard";
import FAQSection from "../components/blog/FAQSection";
import AuthorBox from "../components/blog/AuthorBox";
import RelatedPosts from "../components/blog/RelatedPosts";
import NewsletterBox from "../components/blog/NewsletterBox";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

function QuickPick({ product, rank }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-amber-300 transition-colors">
      <span className="text-xl font-extrabold text-amber-500 w-8 flex-shrink-0">#{rank}</span>
      <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" loading="lazy" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{product.name}</p>
        <p className="text-amber-600 text-sm font-semibold">{product.price_range}</p>
        <p className="text-xs text-gray-500">{product.best_for}</p>
      </div>
      <a
        href={product.affiliate_url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
      >
        <ExternalLink className="w-3 h-3" /> Amazon
      </a>
    </div>
  );
}

export default function BlogPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const { data: dbPost, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) return null;
      const results = await base44.entities.BlogPost.filter({ slug });
      return results[0] || null;
    },
    enabled: !!slug,
  });

  const post = useMemo(() => {
    if (isLoading) return null;
    return dbPost || SAMPLE_POSTS.find(p => p.slug === slug) || SAMPLE_POSTS[0];
  }, [dbPost, slug, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!post) return null;

  // Schema markup JSON-LD
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.meta_description,
    "author": { "@type": "Person", "name": post.author },
    "image": post.featured_image,
    "datePublished": post.created_date || "2024-01-01"
  };

  const topProducts = (post.products || []).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      {/* Hero Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">{post.category}</span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: "Blog", href: createPageUrl("Blog") },
          { label: post.category, href: createPageUrl(`Categories?cat=${encodeURIComponent(post.category)}`) },
          { label: post.title }
        ]} />

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mt-4 mb-6 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.read_time} min read</span>
          <span>By <strong className="text-gray-700">{post.author}</strong></span>
          <span>{post.views?.toLocaleString() || 0} readers</span>
        </div>

        {/* Affiliate Disclosure */}
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <p><strong>Affiliate Disclosure:</strong> DanFinds may earn a commission on Amazon purchases through links on this page — at no extra cost to you. <Link to={createPageUrl("AffiliateDisclosure")} className="underline">Learn more</Link>.</p>
        </div>

        {/* Table of Contents */}
        <TableOfContents
          products={post.products}
          hasFaqs={(post.faqs || []).length > 0}
          hasBuyingGuide={!!post.buying_guide}
        />

        {/* Introduction */}
        <section id="introduction" className="mb-10">
          <p className="text-lg text-gray-700 leading-relaxed">{post.introduction}</p>
        </section>

        {/* Quick Picks */}
        {topProducts.length > 0 && (
          <section id="quick-picks" className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⚡ Quick Picks — Our Top {topProducts.length}</h2>
            <div className="space-y-3">
              {topProducts.map((p, i) => <QuickPick key={i} product={p} rank={i + 1} />)}
            </div>
          </section>
        )}

        {/* Comparison Table */}
        {(post.products || []).length > 1 && (
          <section id="comparison">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comparison Table</h2>
            <ComparisonTable products={post.products} />
          </section>
        )}

        {/* Newsletter after intro */}
        <div className="my-8">
          <NewsletterBox source={`post-${post.slug}`} variant="compact" />
        </div>

        {/* Detailed Reviews */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(post.products || []).map((product, i) => (
              <div key={i} id={`product-${i}`}>
                <ProductCard product={product} rank={i + 1} />
              </div>
            ))}
          </div>
        </section>

        {/* Buying Guide */}
        {post.buying_guide && (
          <section id="buying-guide" className="my-10 bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🛒 Buying Guide</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              {post.buying_guide.split("**").map((chunk, i) =>
                i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <span key={i}>{chunk}</span>
              )}
            </div>
          </section>
        )}

        {/* FAQs */}
        <FAQSection faqs={post.faqs} />

        {/* Conclusion */}
        {post.conclusion && (
          <section id="conclusion" className="my-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Conclusion</h2>
            <p className="text-gray-700 leading-relaxed">{post.conclusion}</p>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="my-10 text-center bg-amber-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to Shop?</h3>
          <p className="mb-4 text-amber-100">Check out our top picks on Amazon now.</p>
          {post.products?.[0] && (
            <a
              href={post.products[0].affiliate_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
            >
              <ExternalLink className="w-5 h-5" /> Check Price on Amazon
            </a>
          )}
        </div>

        {/* Newsletter end of post */}
        <div className="my-10">
          <NewsletterBox source={`post-end-${post.slug}`} />
        </div>

        {/* Author Box */}
        <AuthorBox author={post.author} author_bio={post.author_bio} author_avatar={post.author_avatar} />

        {/* Related Posts */}
        <RelatedPosts slugs={post.related_post_slugs} />
      </div>
    </div>
  );
}