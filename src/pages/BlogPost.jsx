import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Tag, ArrowLeft, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/blog/ProductCard";
import AuthorBox from "@/components/blog/AuthorBox";
import FAQSection from "@/components/blog/FAQSection";
import TableOfContents from "@/components/blog/TableOfContents";
import ComparisonTable from "@/components/blog/ComparisonTable";
import NewsletterBox from "@/components/blog/NewsletterBox";
import Breadcrumb from "@/components/blog/Breadcrumb";

export default function BlogPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blogpost", slug],
    queryFn: () => base44.entities.BlogPost.list("-created_date", 200),
    enabled: !!slug
  });

  const post = posts.find(p => p.slug === slug);

  // Increment views
  const viewMutation = useMutation({
    mutationFn: () => base44.entities.BlogPost.update(post.id, { views: (post.views || 0) + 1 })
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-2xl mb-8 animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Post not found</h1>
        <p className="text-gray-500 mb-6">This post may have been removed or the link is incorrect.</p>
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
          ? <img src={post.products[0].image} alt={post.title} className="w-full h-full object-cover" />
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

        {/* Table of Contents */}
        {post.products?.length > 0 && (
          <TableOfContents
            products={post.products}
            hasBuyingGuide={!!post.buying_guide}
            hasFaqs={post.faqs?.length > 0}
          />
        )}

        {/* Introduction */}
        {post.introduction && (
          <div className="prose prose-gray max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed text-base">{post.introduction}</p>
          </div>
        )}

        {/* Comparison Table */}
        {post.products?.length > 1 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-foreground dark:text-white mb-4">Quick Comparison</h2>
            <ComparisonTable products={post.products} />
          </div>
        )}

        {/* Products */}
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

        {/* Buying Guide */}
        {post.buying_guide && (
          <div id="buying-guide" className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-3">🛒 Buying Guide</h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">{post.buying_guide}</div>
          </div>
        )}

        {/* Conclusion */}
        {post.conclusion && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-3">Final Thoughts</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{post.conclusion}</p>
          </div>
        )}

        {/* FAQs */}
        {post.faqs?.length > 0 && (
          <div id="faqs" className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <FAQSection faqs={post.faqs} />
          </div>
        )}

        {/* Author */}
        <AuthorBox author={post.author} bio={post.author_bio} avatar={post.author_avatar} />

        {/* Newsletter */}
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