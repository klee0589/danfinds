import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PostCard from "../components/blog/PostCard";
import Breadcrumb from "../components/blog/Breadcrumb";
import { SAMPLE_POSTS, CATEGORIES } from "../components/blog/blogData";

const CATEGORY_ICONS = {
  "Best Products": "🏆", "Amazon Finds": "📦", "Home Organization": "🏠",
  "Fitness Gear": "💪", "Tech Accessories": "💻", "Garage Sale Tools": "🏷️",
  "Deals Under $50": "💰", "Product Reviews": "⭐"
};

const CATEGORY_DESC = {
  "Best Products": "The top-rated products on Amazon, tested and reviewed by Dan.",
  "Amazon Finds": "Hidden gems and cult favorites you didn't know you needed.",
  "Home Organization": "Organize every room of your home with the best Amazon picks.",
  "Fitness Gear": "Home gym equipment, workout gear, and sports accessories reviewed.",
  "Tech Accessories": "Cables, hubs, stands, and accessories for your tech setup.",
  "Garage Sale Tools": "Everything you need to run a successful yard sale or flea market.",
  "Deals Under $50": "Great products that won't break the bank.",
  "Product Reviews": "In-depth, honest reviews of popular Amazon products."
};

export default function Categories() {
  const params = new URLSearchParams(window.location.search);
  const activeCat = params.get("cat");

  const filteredPosts = activeCat ? SAMPLE_POSTS.filter(p => p.category === activeCat) : [];

  if (activeCat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb items={[{ label: "Categories", href: createPageUrl("Categories") }, { label: activeCat }]} />
            <div className="mt-4 flex items-center gap-4">
              <span className="text-5xl">{CATEGORY_ICONS[activeCat]}</span>
              <div>
                <h1 className="text-3xl font-extrabold">{activeCat}</h1>
                <p className="text-gray-400 mt-1">{CATEGORY_DESC[activeCat]}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-500 text-sm">{filteredPosts.length} articles in this category</p>
            <Link to={createPageUrl("Categories")} className="text-sm text-amber-600 font-semibold hover:underline">← All Categories</Link>
          </div>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl">No posts in this category yet.</p>
              <Link to={createPageUrl("Blog")} className="text-amber-600 font-semibold mt-3 inline-block hover:underline">Browse all posts →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb items={[{ label: "Categories" }]} />
          <h1 className="text-4xl font-extrabold mt-4 mb-2">Browse by Category</h1>
          <p className="text-gray-400">Find exactly what you're looking for.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map(cat => {
            const count = SAMPLE_POSTS.filter(p => p.category === cat).length;
            const preview = SAMPLE_POSTS.filter(p => p.category === cat)[0];
            return (
              <Link key={cat} to={createPageUrl(`Categories?cat=${encodeURIComponent(cat)}`)} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                {preview && (
                  <div className="h-36 overflow-hidden">
                    <img src={preview.featured_image} alt={cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-3xl mb-2">{CATEGORY_ICONS[cat]}</div>
                  <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{cat}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{CATEGORY_DESC[cat]}</p>
                  <span className="inline-block mt-3 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{count} article{count !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}