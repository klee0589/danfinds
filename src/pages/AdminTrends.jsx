import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Plus, Trash2, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

const CATEGORIES = ["Best Products","Amazon Finds","Home Organization","Fitness Gear","Tech Accessories","Garage Sale Tools","Deals Under $50","Product Reviews"];
const BUYER_INTENT_TEMPLATES = [
  "best ___ under $50", "best ___ for beginners", "top rated ___",
  "best ___ for home", "cheap ___ that actually works", "best ___ on amazon 2026"
];

export default function AdminTrends() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ keyword: "", category: "", source_type: "manual" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSignals(); }, []);

  async function loadSignals() {
    setLoading(true);
    const data = await base44.entities.TrendSignal.list('-created_date', 50);
    setSignals(data);
    setLoading(false);
  }

  async function addSignal(e) {
    e.preventDefault();
    if (!form.keyword) return;
    setSaving(true);
    await base44.entities.TrendSignal.create({
      ...form,
      status: "pending",
      discovery_timestamp: new Date().toISOString()
    });
    setForm({ keyword: "", category: "", source_type: "manual" });
    await loadSignals();
    setSaving(false);
  }

  async function deleteSignal(id) {
    await base44.entities.TrendSignal.delete(id);
    setSignals(prev => prev.filter(s => s.id !== id));
  }

  async function updateStatus(id, status) {
    await base44.entities.TrendSignal.update(id, { status });
    setSignals(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  const statusIcon = (s) => ({
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    processing: <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />
  }[s] || null);

  return (
    <AdminGuard>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("AdminPipeline")} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" /> Stage 1 — Trend Signals
          </h1>
          <p className="text-sm text-gray-500">Add buyer-intent keywords to seed the product discovery pipeline</p>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-bold text-blue-700 mb-2">💡 BUYER INTENT TEMPLATES — click to use</p>
        <div className="flex flex-wrap gap-2">
          {BUYER_INTENT_TEMPLATES.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, keyword: t }))}
              className="text-xs px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={addSignal} className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Signal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="col-span-1 sm:col-span-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder='e.g. "best yoga mat under 50"'
            value={form.keyword}
            onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))}
            required
          />
          <select
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-3 mt-3">
          {["manual","seasonal","social","search"].map(t => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="source" value={t} checked={form.source_type === t} onChange={() => setForm(f => ({ ...f, source_type: t }))} className="accent-amber-500" />
              <span className="text-sm text-gray-600 capitalize">{t}</span>
            </label>
          ))}
          <button type="submit" disabled={saving} className="ml-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Adding..." : "Add Signal"}
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? <p className="text-center text-gray-400 py-10">Loading...</p> : (
        <div className="space-y-2">
          {signals.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No signals yet — add your first keyword above.</p>}
          {signals.map(s => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow transition-shadow">
              {statusIcon(s.status)}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 truncate block">{s.keyword}</span>
                <div className="flex gap-2 mt-0.5">
                  {s.category && <span className="text-xs text-gray-400">{s.category}</span>}
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400 capitalize">{s.source_type}</span>
                </div>
              </div>
              <select
                value={s.status}
                onChange={e => updateStatus(s.id, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {["pending","processing","completed","failed"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <Link to={createPageUrl(`AdminProducts?keyword=${encodeURIComponent(s.keyword)}&category=${encodeURIComponent(s.category || '')}`)}
                className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Add Products →
              </Link>
              <button onClick={() => deleteSignal(s.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}