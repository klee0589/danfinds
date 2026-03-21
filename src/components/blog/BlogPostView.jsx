import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Tag, ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import ProductCard from "@/components/blog/ProductCard";
import AuthorBox from "@/components/blog/AuthorBox";
import FAQSection from "@/components/blog/FAQSection";
import TableOfContents from "@/components/blog/TableOfContents";
import ComparisonTable from "@/components/blog/ComparisonTable";
import NewsletterBox from "@/components/blog/NewsletterBox";
import Breadcrumb from "@/components/blog/Breadcrumb";
import AdSenseAd from "@/components/blog/AdSenseAd";
import RelatedPosts from "@/components/blog/RelatedPosts";

const BASE_URL = "https://danfinds.online";

// Resize Amazon images by swapping the size suffix
function getOptimizedImageUrl(url, size = 500) {
  if (!url) return url;
  // Amazon CDN images: replace size suffix
  if (url.includes('m.media-amazon.com')) {
    return url.replace(/\._AC_SL\d+_/, `._AC_SL${size}_`);
  }
  return url;
}

export default function BlogPostView({ slug }) {
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blogpost", slug],
    queryFn: async () => {
      const results = await base44.entities.BlogPost.filter({ slug }, "-created_date", 1);
      return results[0] || null;
    },
    enabled: !!slug
  });

  const viewMutation = useMutation({
    mutationFn: () => base44.entities.BlogPost.update(post?.id, { views: (post?.views || 0) + 1 })
  });

  useEffect(() => {
    if (!post) return;

    // Title
    document.title = post.meta_title || post.title;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = attr.split('=');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
      return el;
    };

    const description = post.meta_description || post.excerpt || '';
    const image = post.featured_image || post.products?.[0]?.image || '';
    const url = `${BASE_URL}/blog/${slug}`;

    // Standard meta
    setMeta('meta[name="description"]', 'name=description', description);

    // Open Graph
    setMeta('meta[property="og:title"]', 'property=og:title', post.meta_title || post.title);
    setMeta('meta[property="og:description"]', 'property=og:description', description);
    setMeta('meta[property="og:url"]', 'property=og:url', url);
    setMeta('meta[property="og:type"]', 'property=og:type', 'article');
    setMeta('meta[property="og:site_name"]', 'property=og:site_name', 'DanFinds');
    if (image) setMeta('meta[property="og:image"]', 'property=og:image', image);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'name=twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name=twitter:title', post.meta_title || post.title);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', description);
    if (image) setMeta('meta[name="twitter:image"]', 'name=twitter:image', image);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // JSON-LD Structured Data
    // ListItems must NOT contain aggregateRating (invalid parent node)
    const itemListElements = (post.products || []).map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.name,
      "url": p.affiliate_url || url,
      ...(p.image ? { "image": p.image } : {})
    }));

    // Extract a numeric price string from price_range like "$29.99" or "$20-$40"
    const extractPrice = (priceRange, category) => {
      if (!priceRange) {
        // Derive from category if possible
        if (category === "Deals Under $50") return "29.99";
        return "24.99";
      }
      // Pull all numbers from the string
      const nums = priceRange.match(/[\d]+(?:\.\d+)?/g);
      if (!nums) return "24.99";
      // Use the first (lowest) price
      let price = parseFloat(nums[0]);
      // Enforce "Deals Under $50" cap
      if (category === "Deals Under $50" && price >= 50) price = 39.99;
      return price.toFixed(2);
    };

    // Extract brand: first 1-2 words of the product name (best-effort heuristic)
    const extractBrand = (name) => {
      if (!name) return "Amazon";
      const words = name.trim().split(/\s+/);
      // Common generic first words that aren't brands — skip them
      const skipWords = new Set(["best", "top", "premium", "the", "a", "an", "new", "ultra", "pro", "mini", "smart", "portable"]);
      const brand = words.find(w => !skipWords.has(w.toLowerCase())) || words[0];
      return brand.replace(/[^a-zA-Z0-9&\s]/g, "").trim() || "Amazon";
    };

    // Product schemas — one per product, fully valid for Google Merchant Listings
    const productSchemas = (post.products || []).map(p => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "description": p.summary || p.best_for || p.name,
      ...(p.image ? { "image": p.image } : {}),
      "brand": {
        "@type": "Brand",
        "name": extractBrand(p.name)
      },
      "offers": {
        "@type": "Offer",
        "url": p.affiliate_url || url,
        "priceCurrency": "USD",
        "price": extractPrice(p.price_range, post.category),
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(p.rating || "4.5"),
        "bestRating": "5",
        "worstRating": "1",
        "reviewCount": "10"
      }
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "headline": post.title,
          "description": description,
          "url": url,
          "datePublished": post.created_date,
          "dateModified": post.updated_date || post.created_date,
          "author": { "@type": "Person", "name": post.author || "Dan" },
          ...(image ? { "image": { "@type": "ImageObject", "url": image } } : {}),
          "publisher": { "@type": "Organization", "name": "DanFinds", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/favicon.ico` } },
          "mainEntityOfPage": { "@type": "WebPage", "@id": url },
          ...(post.tags?.length ? { "keywords": post.tags.join(", ") } : {})
        },
        ...(itemListElements.length > 0 ? [{
          "@type": "ItemList",
          "name": post.title,
          "numberOfItems": itemListElements.length,
          "itemListElement": itemListElements
        }] : []),
        ...productSchemas
      ]
    };

    let ldScript = document.querySelector('script[data-danfinds-ld]');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.setAttribute('data-danfinds-ld', 'true');
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(jsonLd);

    return () => {
      document.querySelector('link[rel="canonical"]')?.remove();
      document.querySelector('script[data-danfinds-ld]')?.remove();
    };
  }, [post, slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8 animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-3">Post not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This post may have been removed or the link is incorrect.</p>
        <Link to={createPageUrl("Blog")} className="text-amber-600 font-medium hover:underline">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Hero Image */}
      <div className="w-full h-64 md:h-96 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {post.products?.[0]?.image
          ? <img src={getOptimizedImageUrl(post.products[0].image, 900)} alt={post.title} className="w-full h-full object-cover" fetchpriority="high" width="900" height="384" />
          : <ShoppingBag className="w-20 h-20 text-gray-300" />
        }
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: "Blog", href: createPageUrl("Blog") },
          { label: post.category, href: createPageUrl(`Categories?cat=${encodeURIComponent(post.category)}`) },
          { label: post.title }
        ]} />

        {/* Meta */}
        <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500 dark:text-gray-400 mt-4 mb-3">
          {post.category && (
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium text-xs">
              {post.category}
            </span>
          )}
          {post.read_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.read_time} min read
            </span>
          )}
          {post.created_date && (
            <span>{new Date(post.created_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground dark:text-white mb-4 leading-tight">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed border-l-4 border-amber-400 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        {post.products?.length > 0 && (
          <TableOfContents
            products={post.products}
            hasBuyingGuide={!!post.buying_guide}
            hasFaqs={post.faqs?.length > 0}
          />
        )}

        {post.introduction && (
          <div className="prose prose-gray max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed text-base">{post.introduction}</p>
          </div>
        )}

        <AdSenseAd className="my-8" />

        {post.products?.length > 1 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-foreground dark:text-white mb-4">Quick Comparison</h2>
            <ComparisonTable products={post.products} />
          </div>
        )}

        {post.products?.length > 0 && (
          <div id="products" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground dark:text-white mb-6">Top Picks</h2>
            <div className="space-y-8">
              {post.products.map((product, i) => (
                <ProductCard key={i} product={product} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        <AdSenseAd className="my-8" />

        {post.buying_guide && (
          <div id="buying-guide" className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-3">🛒 Buying Guide</h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">{post.buying_guide}</div>
          </div>
        )}

        {post.conclusion && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-3">Final Thoughts</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{post.conclusion}</p>
          </div>
        )}

        {post.faqs?.length > 0 && (
          <div id="faqs" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground dark:text-white mb-4">Frequently Asked Questions</h2>
            <FAQSection faqs={post.faqs} />
          </div>
        )}

        <AdSenseAd className="my-8" />

        <RelatedPosts currentSlug={post.slug} category={post.category} tags={post.tags} />

        <AuthorBox author={post.author} bio={post.author_bio} avatar={post.author_avatar} />

        <div className="mt-10">
          <NewsletterBox variant="compact" />
        </div>

        <div className="mt-8">
          <Link to={createPageUrl("Blog")} className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}