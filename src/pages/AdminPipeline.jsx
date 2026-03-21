import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { LayoutDashboard, Zap, TrendingUp, Package, ClipboardList, Settings, RefreshCw, Layers, Search } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, page: "AdminPipeline" },
  { id: "trends", label: "Trend Signals", icon: TrendingUp, page: "AdminTrends" },
  { id: "products", label: "Products", icon: Package, page: "AdminProducts" },
  { id: "queue", label: "Publish Queue", icon: ClipboardList, page: "AdminQueue" },
  { id: "generate", label: "Generate Post", icon: Zap, page: "AdminGenerate" },
  { id: "cluster",   label: "Content Cluster",  icon: Layers,    page: "AdminCluster"  },
  { id: "keywords",  label: "Keyword Discovery", icon: Search,    page: "AdminKeywords" },
];

export default function AdminPipeline() {
  const [stats, setStats] = useState({ signals: 0, products: 0, queue: 0, published: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.role !== 'admin') return;

        const [signals, products, queue, posts] = await Promise.all([
          base44.entities.TrendSignal.list(),
          base44.entities.Product.list(),
          base44.entities.PublishQueue.filter({ approval_status: "pending" }),
          base44.entities.BlogPost.list()
        ]);
        setStats({
          signals: signals.length,
          products: products.length,
          queue: queue.length,
          published: posts.length
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AdminGuard>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <Zap className="w-8 h-8 text-amber-500" /> DanFinds Pipeline
        </h1>
        <p className="text-gray-500 mt-1">Product discovery, curation & publishing workflow</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 flex-wrap mb-8 border-b border-gray-200 pb-2">
        {TABS.map(tab => (
          <Link
            key={tab.id}
            to={createPageUrl(tab.page)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab.id === "dashboard"
                ? "bg-amber-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Trend Signals", value: stats.signals, color: "text-blue-600", bg: "bg-blue-50", icon: TrendingUp },
          { label: "Products Saved", value: stats.products, color: "text-purple-600", bg: "bg-purple-50", icon: Package },
          { label: "Pending Review", value: stats.queue, color: "text-orange-600", bg: "bg-orange-50", icon: ClipboardList },
          { label: "Posts Published", value: stats.published, color: "text-green-600", bg: "bg-green-50", icon: LayoutDashboard },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5`}>
            <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            stage: "Stage 1",
            title: "Trend Discovery",
            desc: "Add buyer-intent keywords to track. These become the search queries for product discovery.",
            cta: "Add Trend Signal",
            page: "AdminTrends",
            color: "border-blue-400",
            bg: "bg-blue-50",
            steps: ["Enter keyword (e.g. 'best yoga mat under 50')", "Set category & source type", "Mark as pending or process immediately"]
          },
          {
            stage: "Stage 2",
            title: "Product Mapping",
            desc: "Add products manually via ASIN/URL, or activate the Amazon Creators API when you qualify.",
            cta: "Add Products",
            page: "AdminProducts",
            color: "border-purple-400",
            bg: "bg-purple-50",
            steps: ["Paste ASIN, title, price, rating", "Add pros, cons, key features", "Link to trend signal keyword"],
            api_note: "Amazon API: Activates automatically when AMAZON_ACCESS_KEY is set"
          },
          {
            stage: "Stage 3",
            title: "Generate & Publish",
            desc: "AI writes a complete SEO-optimized blog post from your products. Review then publish with one click.",
            cta: "Generate Post",
            page: "AdminGenerate",
            color: "border-green-400",
            bg: "bg-green-50",
            steps: ["Select keyword + products", "AI generates full post in seconds", "Review, edit, publish to live site"]
          }
        ].map((s, i) => (
          <div key={i} className={`border-2 ${s.color} ${s.bg} rounded-2xl p-6`}>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{s.stage}</div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{s.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
            <ul className="space-y-1.5 mb-4">
              {s.steps.map((step, j) => (
                <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white border flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500 mt-0.5">{j+1}</span>
                  {step}
                </li>
              ))}
            </ul>
            {s.api_note && (
              <div className="text-xs bg-white/60 border border-purple-200 rounded-lg px-3 py-2 text-purple-700 mb-3">
                🔑 {s.api_note}
              </div>
            )}
            <Link to={createPageUrl(s.page)} className="block text-center py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
              {s.cta} →
            </Link>
          </div>
        ))}
      </div>

      {/* Content Cluster */}
      <div className="mt-8 bg-purple-50 border-2 border-purple-300 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" /> Content Cluster Generator
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              One keyword → 7 fully interlinked articles: 1 product list, 1 buying guide, 5 individual product reviews. Maximises topical authority & internal linking.
            </p>
          </div>
          <Link to={createPageUrl("AdminCluster")} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 flex-shrink-0">
            <Layers className="w-4 h-4" /> Build a Cluster →
          </Link>
        </div>
      </div>

      {/* Bulk Generate */}
      <div className="mt-8 bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" /> Bulk Generate 20 Posts
            </h3>
            <p className="text-gray-600 text-sm mt-1">AI discovers trending topics and writes 20 full blog posts at once. Images can be added after via Fix Images.</p>
          </div>
          <button
            onClick={async () => {
              setBulkGenerating(true);
              setBulkResult(null);
              let totalCreated = 0;
              const errors = [];
              try {
                // Run 4 batches of 5 posts sequentially
                for (let i = 0; i < 4; i++) {
                  setBulkResult({ progress: `Batch ${i + 1}/4 — generating 5 posts...` });
                  const res = await base44.functions.invoke('generateBulkPosts', { count: 5 });
                  if (res.data?.error) { errors.push(res.data.error); break; }
                  totalCreated += res.data?.posts_created || 0;
                }
                setBulkResult({ success: true, total: totalCreated, errors });
              } catch (e) {
                setBulkResult({ error: e.message });
              } finally {
                setBulkGenerating(false);
              }
            }}
            disabled={bulkGenerating}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            {bulkGenerating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Zap className="w-4 h-4" /> Generate 20 Posts</>}
          </button>
        </div>
        {bulkResult && (
          <div className={`mt-4 rounded-xl p-4 text-sm font-medium ${bulkResult.error ? 'bg-red-100 text-red-700' : bulkResult.progress ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
            {bulkResult.error ? `Error: ${bulkResult.error}` : bulkResult.progress ? `⏳ ${bulkResult.progress}` : `✅ Done! ${bulkResult.total} posts created. Visit Fix Images to add photos.`}
          </div>
        )}
      </div>

      {/* Amazon API Status */}
      <div className="mt-8 bg-gray-900 text-white rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" /> Amazon Creators API Status
            </h3>
            <p className="text-gray-400 text-sm mt-1">Store ID: <span className="text-amber-400 font-mono">danfindsapp11-20</span></p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></div>
            <span className="text-yellow-400 text-sm font-semibold">Credentials Not Set</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            { label: "Requirement", value: "10 qualifying sales in 30 days" },
            { label: "Register at", value: "Associates Central → Tools → Creators API" },
            { label: "Add secrets", value: "AMAZON_ACCESS_KEY + AMAZON_SECRET_KEY" }
          ].map((item, i) => (
            <div key={i} className="bg-gray-800 rounded-xl px-4 py-3">
              <div className="text-gray-400 text-xs mb-0.5">{item.label}</div>
              <div className="text-white font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}