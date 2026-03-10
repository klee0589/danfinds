import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Package, Plus, Trash2, ArrowLeft, Star, ExternalLink, CheckCircle } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

const CATEGORIES = ["Best Products","Amazon Finds","Home Organization","Fitness Gear","Tech Accessories","Garage Sale Tools","Deals Under $50","Product Reviews"];
const STATUSES = ["draft","pending_review","approved","published","rejected"];

const emptyProduct = {
  asin: "", title: "", description: "", image_url: "", affiliate_url: "",
  price_snapshot: "", rating: "", review_count: "", category: "",
  keyword_tag: "", best_for: "", pros: "", cons: "", key_features: "",
  publication_status: "draft", source: "manual"
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const urlParams = new URLSearchParams(window.location.search);
  const preKeyword = urlParams.get("keyword") || "";
  const preCategory = urlParams.get("category") || "";

  useEffect(() => {
    if (preKeyword) setForm(f => ({ ...f, keyword_tag: preKeyword, category: preCategory }));
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await base44.entities.Product.list('-created_date', 100);
    setProducts(data);
    setLoading(false);
  }

  async function saveProduct(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      rating: form.rating ? parseFloat(form.rating) : undefined,
      review_count: form.review_count ? parseInt(form.review_count) : undefined,
      pros: form.pros ? form.pros.split('\n').filter(Boolean) : [],
      cons: form.cons ? form.cons.split('\n').filter(Boolean) : [],
      key_features: form.key_features ? form.key_features.split('\n').filter(Boolean) : [],
    };
    // Build affiliate URL from ASIN if not provided
    if (payload.asin && !payload.affiliate_url) {
      payload.affiliate_url = `https://www.amazon.com/dp/${payload.asin}?tag=danfindsapp11-20`;
    }
    await base44.entities.Product.create(payload);
    setForm({ ...emptyProduct, keyword_tag: preKeyword, category: preCategory });
    setShowForm(false);
    await loadProducts();
    setSaving(false);
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    await base44.entities.Product.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function updateStatus(id, publication_status) {
    await base44.entities.Product.update(id, { publication_status });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, publication_status } : p));
  }

  const filtered = filterStatus === "all" ? products : products.filter(p => p.publication_status === filterStatus);

  const statusColors = { draft: "bg-gray-100 text-gray-600", pending_review: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", published: "bg-blue-100 text-blue-700", rejected: "bg-red-100 text-red-600" };

  return (
    <AdminGuard>
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("AdminPipeline")} className="text-gray-400 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-500" /> Stage 2 — Products
          </h1>
          {preKeyword && <p className="text-sm text-gray-500">Keyword: <span className="font-medium text-amber-600">{preKeyword}</span></p>}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={saveProduct} className="bg-white border-2 border-purple-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Add Product Manually</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder="ASIN (e.g. B08N5WRWNW)" value={form.asin} onChange={e => setForm(f => ({...f, asin: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input className="input-field" placeholder="Product Title *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input placeholder="Affiliate URL (auto-built from ASIN)" value={form.affiliate_url} onChange={e => setForm(f => ({...f, affiliate_url: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input placeholder="Price (e.g. $29.99)" value={form.price_snapshot} onChange={e => setForm(f => ({...f, price_snapshot: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input placeholder="Rating (e.g. 4.5)" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm(f => ({...f, rating: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input placeholder="Review count" type="number" value={form.review_count} onChange={e => setForm(f => ({...f, review_count: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input placeholder="Best for (e.g. Beginners)" value={form.best_for} onChange={e => setForm(f => ({...f, best_for: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <input placeholder="Keyword tag" value={form.keyword_tag} onChange={e => setForm(f => ({...f, keyword_tag: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Pros (one per line)" value={form.pros} onChange={e => setForm(f => ({...f, pros: e.target.value}))} rows={3} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <textarea placeholder="Cons (one per line)" value={form.cons} onChange={e => setForm(f => ({...f, cons: e.target.value}))} rows={3} style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
            <textarea placeholder="Key features (one per line)" value={form.key_features} onChange={e => setForm(f => ({...f, key_features: e.target.value}))} rows={3} className="col-span-1 sm:col-span-2" style={{padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", outline:"none"}} />
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60">{saving ? "Saving..." : "Save Product"}</button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>

      {/* Products List */}
      {loading ? <p className="text-center text-gray-400 py-10">Loading...</p> : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No products yet.</p>}
          {filtered.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow transition-shadow">
              {p.image_url && <img src={p.image_url} alt={p.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {p.asin && <span className="text-xs text-gray-400 font-mono">ASIN: {p.asin}</span>}
                      {p.price_snapshot && <span className="text-xs font-bold text-green-700">{p.price_snapshot}</span>}
                      {p.rating && <span className="flex items-center gap-0.5 text-xs text-amber-600"><Star className="w-3 h-3 fill-amber-400" />{p.rating}</span>}
                      {p.keyword_tag && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{p.keyword_tag}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select value={p.publication_status} onChange={e => updateStatus(p.id, e.target.value)} className={`text-xs px-2 py-1 rounded-lg font-medium border-0 focus:outline-none focus:ring-1 focus:ring-amber-400 ${statusColors[p.publication_status]}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {p.affiliate_url && <a href={p.affiliate_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-amber-500"><ExternalLink className="w-4 h-4" /></a>}
                    <button onClick={() => deleteProduct(p.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {p.best_for && <p className="text-xs text-gray-500 mt-1">Best for: {p.best_for}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate CTA */}
      {filtered.filter(p => p.publication_status === 'approved').length >= 2 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-green-800 flex items-center gap-1.5"><CheckCircle className="w-5 h-5" /> Ready to generate!</p>
            <p className="text-sm text-green-700">{filtered.filter(p => p.publication_status === 'approved').length} approved products ready for AI post generation.</p>
          </div>
          <Link to={createPageUrl("AdminGenerate")} className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-colors flex-shrink-0">
            Generate Post →
          </Link>
        </div>
      )}
    </div>
  );
}