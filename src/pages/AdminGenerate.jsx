import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Zap, ArrowLeft, CheckCircle, AlertCircle, Eye, Send } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import ReactMarkdown from "react-markdown";

const CATEGORIES = ["Best Products","Amazon Finds","Home Organization","Fitness Gear","Tech Accessories","Garage Sale Tools","Deals Under $50","Product Reviews"];

export default function AdminGenerate() {
  const [products, setProducts] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState("json");

  useEffect(() => {
    async function load() {
      const [prods, sigs] = await Promise.all([
        base44.entities.Product.filter({ publication_status: "approved" }),
        base44.entities.TrendSignal.list('-created_date', 20)
      ]);
      setProducts(prods);
      setSignals(sigs);
      setLoading(false);
    }
    load();
  }, []);

  function toggleProduct(id) {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function generate() {
    if (!keyword || selectedProductIds.length < 1) {
      setError("Please enter a keyword and select at least 1 product.");
      return;
    }
    setError("");
    setGenerating(true);
    setGenerated(null);

    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
    const productPayload = selectedProducts.map(p => ({
      asin: p.asin,
      title: p.title,
      price_snapshot: p.price_snapshot,
      rating: p.rating,
      review_count: p.review_count,
      best_for: p.best_for,
      pros: p.pros || [],
      cons: p.cons || [],
      key_features: p.key_features || [],
      affiliate_url: p.affiliate_url,
      image_url: p.image_url
    }));

    const res = await base44.functions.invoke('generateBlogPost', {
      keyword, category, products: productPayload
    });

    if (res.data?.success) {
      // Merge product images from our database into the generated post
      const post = res.data.post;
      if (post.products) {
        post.products = post.products.map((gp, i) => ({
          ...gp,
          image: selectedProducts[i]?.image_url || gp.image || ""
        }));
      }
      post.category = category;
      setGenerated(post);
    } else {
      setError(res.data?.error || "Generation failed. Try again.");
    }
    setGenerating(false);
  }

  async function publish() {
    if (!generated) return;
    setPublishing(true);
    const featuredImage = products.find(p => selectedProductIds.includes(p.id))?.image_url;

    const queueEntry = await base44.entities.PublishQueue.create({
      approval_status: "approved",
      post_title: generated.title,
      post_slug: generated.slug,
      category: generated.category
    });

    const res = await base44.functions.invoke('publishBlogPost', {
      postData: generated,
      queueId: queueEntry.id,
      featuredImage
    });

    if (res.data?.success) {
      // Mark products as published
      await Promise.all(selectedProductIds.map(id =>
        base44.entities.Product.update(id, { publication_status: "published", linked_post_slug: generated.slug })
      ));
      setPublished(true);
    } else {
      setError(res.data?.error || "Publish failed.");
    }
    setPublishing(false);
  }

  if (published) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Post Published! 🎉</h2>
      <p className="text-gray-600 mb-6">"{generated?.title}" is now live on DanFinds.</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to={createPageUrl(`BlogPost?slug=${generated?.slug}`)} className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600">View Post →</Link>
        <Link to={createPageUrl("AdminGenerate")} onClick={() => { setPublished(false); setGenerated(null); setSelectedProductIds([]); setKeyword(""); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200">Generate Another</Link>
        <Link to={createPageUrl("AdminPipeline")} className="px-5 py-2.5 border border-gray-300 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50">Dashboard</Link>
      </div>
    </div>
  );

  return (
    <AdminGuard>
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("AdminPipeline")} className="text-gray-400 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" /> Stage 3 — Generate & Publish
          </h1>
          <p className="text-sm text-gray-500">AI writes the full blog post from your curated products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Config */}
        <div className="space-y-5">
          {/* Keyword */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">Keyword / Topic *</label>
            <input
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder='e.g. "best yoga mat under 50"'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            {signals.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-400">From signals:</span>
                {signals.filter(s => s.status !== 'completed').slice(0, 6).map(s => (
                  <button key={s.id} onClick={() => { setKeyword(s.keyword); setCategory(s.category || ''); }}
                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                    {s.keyword}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Category</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Select Products ({selectedProductIds.length} selected)
            </label>
            {loading ? <p className="text-sm text-gray-400">Loading products...</p> : (
              products.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No approved products yet.</p>
                  <Link to={createPageUrl("AdminProducts")} className="text-sm text-amber-600 underline">Add & approve products first →</Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {products.map(p => (
                    <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedProductIds.includes(p.id) ? 'border-amber-400 bg-amber-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-amber-500 w-4 h-4" />
                      {p.image_url && <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.price_snapshot} {p.rating && `• ★${p.rating}`} {p.best_for && `• ${p.best_for}`}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={generating || !keyword || selectedProductIds.length === 0}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-base transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating with AI...</>
            ) : (
              <><Zap className="w-5 h-5" /> Generate Blog Post</>
            )}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <span className="font-bold text-gray-700 text-sm">Preview</span>
            {generated && (
              <div className="flex gap-2">
                <button onClick={() => setPreviewMode("json")} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${previewMode === 'json' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>JSON</button>
                <button onClick={() => setPreviewMode("content")} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${previewMode === 'content' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Content</button>
              </div>
            )}
          </div>

          {!generated && !generating && (
            <div className="flex flex-col items-center justify-center h-80 text-center px-8 text-gray-400">
              <Zap className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Your AI-generated post will appear here. Select a keyword and products, then click Generate.</p>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center h-80 text-center px-8 text-gray-400">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-gray-600">AI is writing your post...</p>
              <p className="text-xs text-gray-400 mt-1">This takes about 10–20 seconds</p>
            </div>
          )}

          {generated && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-5 max-h-96">
                {previewMode === "json" ? (
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-4 overflow-x-auto">
                    {JSON.stringify(generated, null, 2)}
                  </pre>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <h2 className="text-lg font-extrabold text-gray-900">{generated.title}</h2>
                    <p className="text-xs text-gray-500 mb-3">{generated.excerpt}</p>
                    <div className="text-sm"><ReactMarkdown>{generated.introduction}</ReactMarkdown></div>
                    {generated.products?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-bold text-sm">Products ({generated.products.length})</h3>
                        {generated.products.map((p, i) => (
                          <div key={i} className="flex gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
                            {p.image && <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />}
                            <div>
                              <p className="text-xs font-bold">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.price_range} • ★{p.rating}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <button
                  onClick={publish}
                  disabled={publishing}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white font-extrabold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {publishing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing...</> : <><Send className="w-4 h-4" /> Publish to DanFinds</>}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">Post will be saved to the database and appear on the live site.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}