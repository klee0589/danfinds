import { Clock, Tag } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = {
  "Best Products": "bg-purple-100 text-purple-700",
  "Amazon Finds": "bg-amber-100 text-amber-700",
  "Home Organization": "bg-green-100 text-green-700",
  "Fitness Gear": "bg-red-100 text-red-700",
  "Tech Accessories": "bg-blue-100 text-blue-700",
  "Garage Sale Tools": "bg-orange-100 text-orange-700",
  "Deals Under $50": "bg-pink-100 text-pink-700",
  "Product Reviews": "bg-indigo-100 text-indigo-700"
};

export default function PostCard({ post, featured = false }) {
  const url = createPageUrl(`BlogPost?slug=${post.slug}`);

  const featuredImgSrc = post.featured_image || post.products?.[0]?.image || null;

  if (featured) {
    return (
      <Link to={url} className="block group">
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow">
          {featuredImgSrc && (
            <img
              src={featuredImgSrc}
              alt={post.title}
              className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-6 text-white">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${CATEGORY_COLORS[post.category] || "bg-amber-100 text-amber-700"}`}>
              {post.category}
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2 group-hover:text-amber-300 transition-colors">{post.title}</h2>
            <p className="text-gray-300 text-sm line-clamp-2">{post.excerpt}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time} min read</span>
              <span>By {post.author}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={url} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full flex flex-col">
        <div className="overflow-hidden">
          <img
            src={featuredImgSrc}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <span className={`inline-block self-start text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${CATEGORY_COLORS[post.category] || "bg-amber-100 text-amber-700"}`}>
            {post.category}
          </span>
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">{post.title}</h3>
          <p className="text-gray-500 text-sm flex-1 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time || 8} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}