import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, RefreshCw, CheckCircle, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

const SLUGS = [
  { slug: "5-best-smart-jump-ropes-fitness-goals-2026", impressions: 271, position: 8.7, priority: "🔥 URGENT" },
  { slug: "best-ergonomic-vertical-mice-under-45", impressions: 70, position: 11.0 },
  { slug: "best-portable-power-banks-built-in-cables-spring-travel-2026", impressions: 59, position: 15.0 },
  { slug: "5-best-solar-motion-sensor-outdoor-lights-spring-2026", impressions: 47, position: 10.8 },
  { slug: "best-solar-motion-security-lights-under-55-2026", impressions: 44, position: 18.8 },
  { slug: "best-over-the-door-pantry-organizers-2026", impressions: 26, position: 9.3 },
  { slug: "best-self-watering-indoor-herb-garden-kits-under-50", impressions: 16, position: 7.3 },
  { slug: "top-under-sink-pull-out-organizers-bathroom-2026", impressions: 11, position: 11.2 },
];

export default function AdminSEO() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(new Set(SLUGS.map(s => s.slug)));

  function toggleSlug(slug) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(slug) ? n.delete(slug) : n.add(slug);
      return n;
    });
  }

  async function runFix() {
    setRunning(true);
    setResults([]);
    setErrors([]);
    const res = await base44.functions.invoke("fixMetaTitles", { slugs: [...selected] });
    if (res.data?.success) {
      setResults(res.data.results || []);
      setErrors(res.data.errors || []);
    } else {
      setErrors([{ slug: "all", error: res.data?.error || "Unknown error" }]);
    }
    setRunning(false);
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("AdminPipeline")} className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-amber-500" /> SEO Meta Rewriter
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Fix zero-click pages using Search Console data + AI rewrites</p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Search Console Diagnosis</p>
          <p className="text-sm text-amber-700">8 pages with high impressions, 0 clicks. Total impressions wasted: <strong>544</strong>. Top offender: smart jump ropes (271 impressions, pos 8.7, 0 clicks).</p>
        </div>

        {/* Slug selector */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-gray-800 text-sm">Pages to Rewrite ({selected.size} selected)</p>
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set(SLUGS.map(s => s.slug)))} className="text-xs text-amber-600 hover:underline">All</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:underline">None</button>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {SLUGS.map(item => (
              <label key={item.slug} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(item.slug)}
                  onChange={() => toggleSlug(item.slug)}
                  className="accent-amber-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.slug}</p>
                  <p className="text-xs text-gray-400">{item.impressions} impressions · pos {item.position}</p>
                </div>
                {item.priority && <span className="text-xs font-bold text-red-600 flex-shrink-0">{item.priority}</span>}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={runFix}
          disabled={running || selected.size === 0}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 mb-6"
        >
          {running
            ? <><RefreshCw className="w-5 h-5 animate-spin" /> Rewriting {selected.size} posts… (may take ~1 min)</>
            : <><Search className="w-5 h-5" /> Rewrite Meta for {selected.size} Pages</>
          }
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="font-bold text-gray-800">Updated {results.length} pages</p>
            </div>
            <div className="divide-y divide-gray-50">
              {results.map((r, i) => (
                <div key={i} className="px-5 py-4">
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.slug}</p>
                      <p className="text-xs text-green-700 mt-0.5 font-medium">{r.new_meta_title}</p>
                    </div>
                    {expanded === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>
                  {expanded === i && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-red-600 mb-1">OLD TITLE</p>
                          <p className="text-xs text-gray-700">{r.old_meta_title}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-green-600 mb-1">NEW TITLE</p>
                          <p className="text-xs text-gray-700">{r.new_meta_title}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-red-600 mb-1">OLD DESCRIPTION</p>
                          <p className="text-xs text-gray-700">{r.old_meta_description}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-green-600 mb-1">NEW DESCRIPTION</p>
                          <p className="text-xs text-gray-700">{r.new_meta_description}</p>
                        </div>
                      </div>
                      {r.reasoning && (
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-blue-600 mb-1">WHY THIS WORKS</p>
                          <p className="text-xs text-gray-700">{r.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {e.slug}: {e.error}
              </p>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}