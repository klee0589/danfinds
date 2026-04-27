import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Star, Zap, ShieldCheck, TrendingUp, Search, Package, CheckCircle } from "lucide-react";
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

  // SEO: page title + meta
  useEffect(() => {
    document.title = "DanFinds - Best Amazon Product Reviews & Deals 2026";
    let desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Honest, hands-on Amazon product reviews across fitness gear, tech accessories, home organization & more. Only 4+ star picks. Updated weekly for 2026.');
  }, []);

  // JSON-LD: WebSite + Organization
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-website-ld", "true");
    script.textContent = JSON.stringify([
      {
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
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "DanFinds",
        "url": "https://danfinds.online",
        "description": "Honest Amazon product reviews and curated deals.",
        "sameAs": ["https://danfinds.online"]
      }
    ]);
    document.head.appendChild(script);
    return () => document.querySelector("script[data-website-ld]")?.remove();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" /> Updated daily - April 2026
          </div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Best Amazon Product Reviews &amp;<br />
            <span className="text-amber-400">Deals Worth Buying in 2026</span>
          </h1>
          <p className="text-gray-300 text-lg mb-4 max-w-xl mx-auto">
            Hand-picked product reviews across fitness gear, tech accessories, home organization, and more. No paid placements - only items that actually earned it.
          </p>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">Trusted by 10,000+ smart shoppers. Only 4+ star products make the cut.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={createPageUrl("Blog")} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
              Browse All Reviews <ArrowRight className="w-4 h-4" />
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
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-500" /> Independent &amp; honest</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Daily new posts</span>
        </div>
      </section>

      {/* Featured Post */}
      {featured && !isLoading && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Featured Post</h2>
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

      {/* Why Trust Us */}
      <section className="bg-white py-14 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Why Readers Trust DanFinds</h2>
          <p className="text-gray-500 text-center text-sm mb-10 max-w-xl mx-auto">Amazon has over 350 million products. We do the hard work so you don't waste money on the wrong one.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {[
              { icon: ShieldCheck, title: "No Paid Placements — Ever", desc: "We've never accepted a brand sponsorship or a free product in exchange for a positive review. Every recommendation is chosen on merit alone. If something didn't earn its spot, it doesn't appear here." },
              { icon: Search, title: "Hundreds of Reviews Analyzed", desc: "Before writing a single word, we read through hundreds of verified customer reviews — the ones with photos, update notes, and real complaints — to find what actually matters and what marketing language glosses over." },
              { icon: CheckCircle, title: "Only 4+ Star Products Make the Cut", desc: "We don't publish a product with under a 4.0-star rating or fewer than 100 verified reviews. Widespread customer satisfaction is a prerequisite, not a bonus." },
              { icon: TrendingUp, title: "Updated When Products Change", desc: "Amazon listings change. Products get discontinued, ratings drop, better alternatives emerge. We revisit and update posts when the landscape shifts, so our recommendations stay accurate." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to={createPageUrl("About")} className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-semibold text-sm">
              Learn more about our editorial process <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">How DanFinds Works</h2>
          <p className="text-gray-500 text-center text-sm mb-8">No sponsored content. No guesswork. Just honest picks.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Search, step: "1", title: "Deep Research", desc: "We scan thousands of Amazon products, filter by real customer ratings and review depth, and identify the most common complaints and praises before writing a word." },
              { icon: CheckCircle, step: "2", title: "Honest Curation", desc: "Only products with 4+ stars and meaningful reviews make it to our list. We document real pros and cons — including the ones brands don't want you to know." },
              { icon: Package, step: "3", title: "Clear Writing", desc: "We write plain-English breakdowns tailored to specific use cases so you can find the right fit quickly — then link straight to Amazon with our affiliate tag." },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Step {item.step}</div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <NewsletterBox />
      </section>
    </div>
  );
}