import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/blog/PostCard";

const CATEGORIES = [
  { name: "Best Products", emoji: "🏆", desc: "The absolute best picks across all categories" },
  { name: "Amazon Finds", emoji: "📦", desc: "Hidden gems and trending Amazon discoveries" },
  { name: "Home Organization", emoji: "🏠", desc: "Declutter and organize every room" },
  { name: "Fitness Gear", emoji: "💪", desc: "Top-rated gym and home workout equipment" },
  { name: "Tech Accessories", emoji: "🔌", desc: "Gadgets and accessories worth your money" },
  { name: "Garage Sale Tools", emoji: "🔧", desc: "Tools and gear for the workshop" },
  { name: "Deals Under $50", emoji: "💰", desc: "Great products that won't break the bank" },
  { name: "Product Reviews", emoji: "⭐", desc: "In-depth reviews of popular products" },
];

export default function Categories() {
  const params = new URLSearchParams(window.location.search);
  const initialCat = params.get("cat") || "";
  const [activeCategory, setActiveCategory] = useState(initialCat);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blogposts-categories"],
    queryFn: () => base44.entities.BlogPost.list("-created_date", 200)
  });

  const filtered = activeCategory
    ? posts.filter(p => p.category === activeCategory)
    : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-2">Browse by Category</h1>
          <p className="text-gray-400">Find exactly what you're looking for.</p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => setActiveCategory("")}
            className={`rounded-2xl p-4 text-left font-semibold text-sm transition-all border-2 ${
              !activeCategory
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-transparent bg-white text-gray-700 hover:border-amber-200"
            }`}
          >
            <div className="text-2xl mb-1">🔍</div>
            All Categories
            <div className="text-xs font-normal text-gray-500 mt-0.5">{posts.length} posts</div>
          </button>
          {CATEGORIES.map(cat => {
            const count = posts.filter(p => p.category === cat.name).length;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`rounded-2xl p-4 text-left font-semibold text-sm transition-all border-2 ${
                  activeCategory === cat.name
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-transparent bg-white text-gray-700 hover:border-amber-200"
                }`}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                {cat.name}
                <div className="text-xs font-normal text-gray-500 mt-0.5">{count} post{count !== 1 ? "s" : ""}</div>
              </button>
            );
          })}
        </div>

        {/* Posts */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {activeCategory || "All Posts"} <span className="text-gray-400 font-normal text-base">({filtered.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No posts in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}