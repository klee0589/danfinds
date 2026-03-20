import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Star, Zap, ShieldCheck, TrendingUp } from "lucide-react";
import PostCard from "@/components/blog/PostCard";
import NewsletterBox from "@/components/blog/NewsletterBox";

const CATEGORIES = [
  { name: "Fitness Gear", emoji: "💪", color: "bg-blue-50 text-blue-700" },
  { name: "Tech Accessories", emoji: "🔌", color: "bg-purple-50 text-purple-700" },
  { name: "Home Organization", emoji: "🏠", color: "bg-green-50 text-green-700" },
  { name: "Deals Under $50", emoji: "💰", color: "bg-amber-50 text-amber-700" },
  { name: "Amazon Finds", emoji: "📦", color: "bg-orange-50 text-orange-700" },
  { name: "Product Reviews", emoji: "⭐", color: "bg-pink-50 text-pink-700" },
];

export default function Home() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blogposts-home"],
    queryFn: () => base44.entities.BlogPost.list("-created_date", 13)
  });

  const featured = posts.find(p => p.is_featured) || posts[0];
  const recent = posts.filter(p => p.id !== featured?.id).slice(0, 6);

  // WebSite JSON-LD
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-website-ld", "true");
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "DanFinds",
      "url": "https://danfinds.online",
      "description": "Honest Amazon product reviews and curated deals to help you buy smarter.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://danfinds.online/Blog?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
    document.head.appendChild(script);
    return () => document.querySelector("script[data-website-ld]")?.remove();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" /> Fresh deals updated daily
          </div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Amazon Finds You'll<br />
            <span className="text-amber-400">Actually Love</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Honest reviews and hand-picked Amazon deals. No fluff, no filler — just the best products worth your money.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={createPageUrl("Blog")} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
              Browse All Posts <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={createPageUrl("Categories")} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
              Shop by Category
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-amber-50 border-y border-amber-100 py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-amber-800 font-medium">
          <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> Only 4+ star picks</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-500" /> Independent & honest</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Daily new posts</span>
        </div>
      </section>

      {/* Featured Post */}
      {featured && !isLoading && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">⭐ Featured Post</h2>
          <PostCard post={featured} featured={true} />
        </section>
      )}

      {/* Categories */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={createPageUrl(`Categories?cat=${encodeURIComponent(cat.name)}`)}
                className={`${cat.color} rounded-2xl p-4 text-center font-semibold text-sm hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Latest Posts</h2>
          <Link to={createPageUrl("Blog")} className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <NewsletterBox />
      </section>
    </div>
  );
}