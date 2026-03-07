import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { createPageUrl } from "@/utils";
import PostCard from "../components/blog/PostCard";
import NewsletterBox from "../components/blog/NewsletterBox";
import { SAMPLE_POSTS, CATEGORIES } from "../components/blog/blogData";
import Breadcrumb from "../components/blog/Breadcrumb";

const CATEGORY_ICONS = {
  "Best Products": "🏆", "Amazon Finds": "📦", "Home Organization": "🏠",
  "Fitness Gear": "💪", "Tech Accessories": "💻", "Garage Sale Tools": "🏷️",
  "Deals Under $50": "💰", "Product Reviews": "⭐"
};

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return SAMPLE_POSTS.filter(post => {
      const matchCat = activeCategory === "All" || post.category === activeCategory;
      const matchSearch = !search || post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const featuredPost = SAMPLE_POSTS.find(p => p.is_featured);
  const popularPosts = [...SAMPLE_POSTS].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb items={[{ label: "Blog" }]} />
          <h1 className="text-4xl font-extrabold mt-4 mb-2">Amazon Product Reviews & Buyer's Guides</h1>
          <p className="text-gray-400 mb-6">Honest, detailed reviews to help you buy smarter on Amazon.</p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews (e.g. punching bag, desk accessories…)"
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-[65px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory("All")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeCategory === "All" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            All Posts
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeCategory === cat ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main */}
          <div className="flex-1">
            {/* Featured */}
            {!search && activeCategory === "All" && featuredPost && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wide mb-4">⭐ Featured</h2>
                <PostCard post={featuredPost} featured={true} />
              </div>
            )}

            {/* Newsletter inline */}
            {!search && activeCategory === "All" && (
              <div className="mb-8">
                <NewsletterBox source="blog-page" />
              </div>
            )}

            {/* Grid */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {search ? `Results for "${search}"` : activeCategory === "All" ? "All Reviews" : activeCategory}
                <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} articles)</span>
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filtered.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🔥 Most Popular</h3>
              <ul className="space-y-3">
                {popularPosts.map((post, i) => (
                  <li key={post.id} className="flex gap-3 group">
                    <span className="text-2xl font-extrabold text-gray-100 flex-shrink-0 leading-none">{i + 1}</span>
                    <a href={createPageUrl(`BlogPost?slug=${post.slug}`)} className="text-sm text-gray-700 group-hover:text-amber-600 transition-colors font-medium leading-snug">{post.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Browse Categories</h3>
              <ul className="space-y-2">
                {CATEGORIES.map(cat => {
                  const count = SAMPLE_POSTS.filter(p => p.category === cat).length;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-amber-600 transition-colors py-1"
                      >
                        <span>{CATEGORY_ICONS[cat]} {cat}</span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <NewsletterBox source="blog-sidebar" variant="compact" />
          </aside>
        </div>
      </div>
    </div>
  );
}