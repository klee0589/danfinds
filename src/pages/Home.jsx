import { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, TrendingUp, Star, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PostCard from "../components/blog/PostCard";
import NewsletterBox from "../components/blog/NewsletterBox";
import { SAMPLE_POSTS, CATEGORIES } from "../components/blog/blogData";

const CATEGORY_ICONS = {
  "Best Products": "🏆",
  "Amazon Finds": "📦",
  "Home Organization": "🏠",
  "Fitness Gear": "💪",
  "Tech Accessories": "💻",
  "Garage Sale Tools": "🏷️",
  "Deals Under $50": "💰",
  "Product Reviews": "⭐"
};

export default function Home() {
  const { data: dbPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
  });

  const allPosts = useMemo(() => {
    const dbSlugs = new Set(dbPosts.map(p => p.slug));
    return [...dbPosts, ...SAMPLE_POSTS.filter(p => !dbSlugs.has(p.slug))];
  }, [dbPosts]);

  const featuredPosts = allPosts.filter(p => p.is_featured).slice(0, 3);
  const latestPosts = allPosts.slice(0, 6);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" /> Updated daily with the best Amazon finds
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Find the Best Products <span className="text-amber-400">on Amazon</span> — Without the Guesswork
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Honest reviews, comparison guides, and curated deals across fitness, home, tech, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Blog")} className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              Browse All Reviews <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex justify-center gap-8 mt-10 text-sm text-gray-400">
            <div className="text-center"><div className="text-2xl font-bold text-white">{allPosts.length}+</div>Reviews Published</div>
            <div className="text-center"><div className="text-2xl font-bold text-white">10K+</div>Monthly Readers</div>
            <div className="text-center"><div className="text-2xl font-bold text-white">100%</div>Honest Opinions</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) =>
              <Link
                key={cat}
                to={createPageUrl(`Categories?cat=${encodeURIComponent(cat)}`)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-amber-400 hover:text-amber-600 transition-colors shadow-sm">
                <span>{CATEGORY_ICONS[cat]}</span>
                {cat}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Featured Guides</h2>
                <p className="text-gray-500 mt-1">Our most popular buyer's guides</p>
              </div>
              <Link to={createPageUrl("Blog")} className="text-amber-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post, i) =>
                <PostCard key={post.id || post.slug || i} post={post} featured={false} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Banner */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <NewsletterBox source="homepage" />
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Latest Reviews</h2>
              <p className="text-gray-500 mt-1">Fresh off the desk</p>
            </div>
            <Link to={createPageUrl("Blog")} className="text-amber-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post, i) =>
              <PostCard key={post.id || post.slug || i} post={post} />
            )}
          </div>
        </div>
      </section>

      {/* Popular Posts */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-amber-500" /> Most Popular
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularPosts.map((post, i) =>
              <Link key={post.id || post.slug || i} to={createPageUrl(`BlogPost?slug=${post.slug}`)} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <span className="text-4xl font-extrabold text-gray-100 flex-shrink-0 leading-none">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <span className="text-xs font-bold text-amber-600">{post.category}</span>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mt-0.5 group-hover:text-amber-600 transition-colors">{post.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{post.views?.toLocaleString() || 0} views</span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-900 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Why Trust DanFinds?</h2>
          <p className="text-gray-400 mb-8">Every product is independently researched and tested. We never recommend anything we wouldn't buy ourselves.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "Independently Researched", desc: "Hours of testing and research behind every review" },
              { icon: "💯", title: "Honest Opinions", desc: "We highlight the good AND the bad of every product" },
              { icon: "🔄", title: "Regularly Updated", desc: "Reviews updated as products and prices change" }
            ].map((item, i) =>
              <div key={i} className="bg-gray-800 rounded-xl p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}