import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Layers, ArrowLeft, CheckCircle, AlertCircle, ExternalLink, BookOpen, Star, List } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

const CATEGORIES = [
  "Best Products", "Amazon Finds", "Home Organization",
  "Fitness Gear", "Tech Accessories", "Garage Sale Tools", "Deals Under $50", "Product Reviews"
];

const TYPE_META = {
  list:   { label: "Product List",   icon: List,     color: "bg-amber-100 text-amber-700" },
  guide:  { label: "Buying Guide",   icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  review: { label: "Product Review", icon: Star,     color: "bg-green-100 text-green-700" },
};

export default function AdminCluster() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!keyword.trim()) { setError("Please enter a keyword."); return; }
    setError("");
    setResult(null);
    setLog([]);
    setRunning(true);

    // Poll-style: the function streams log entries via the response
    try {
      const res = await base44.functions.invoke("generateCluster", { keyword: keyword.trim(), category });
      if (res.data?.success) {
        setLog(res.data.log || []);
        setResult(res.data.cluster);
      } else {
        setError(res.data?.error || "Generation failed.");
        setLog(res.data?.log || []);
      }
    } catch (e) {
      setError(e.message || "Unexpected error.");
    }
    setRunning(false);
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("AdminPipeline")} className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-500" /> Content Cluster Generator
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              One keyword → 7 interlinked articles (1 list + 1 buying guide + 5 reviews)
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Keyword / Topic *</label>
              <input
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder='e.g. "best resistance bands", "standing desk mat"'
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                disabled={running}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={running}
              >
                <option value="">Auto-select</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* What gets created */}
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <span key={type} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                <meta.icon className="w-3.5 h-3.5" />
                {type === "review" ? "5× Product Reviews" : `1× ${meta.label}`}
              </span>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={running || !keyword.trim()}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {running ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating cluster… (~2 min)</>
            ) : (
              <><Layers className="w-5 h-5" /> Generate Full Cluster</>
            )}
          </button>
          {running && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Generating 7 articles in sequence. Please keep this tab open.
            </p>
          )}
        </div>

        {/* Live log */}
        {(log.length > 0 || running) && (
          <div className="bg-gray-900 rounded-2xl p-5 mb-6 font-mono text-sm">
            <p className="text-gray-400 text-xs mb-3 font-sans font-semibold uppercase tracking-wide">Generation Log</p>
            <div className="space-y-1.5">
              {log.map((line, i) => (
                <p key={i} className={`${line.startsWith('✓') || line.startsWith('🎉') ? 'text-green-400' : 'text-gray-300'}`}>
                  {line}
                </p>
              ))}
              {running && (
                <p className="text-amber-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Working…
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="font-extrabold text-gray-900">Cluster Published — {7} articles live</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {/* List */}
              {result.list && <ClusterRow item={result.list} type="list" />}
              {/* Guide */}
              {result.guide && <ClusterRow item={result.guide} type="guide" />}
              {/* Reviews */}
              {(result.reviews || []).map((r, i) => (
                <ClusterRow key={i} item={r} type="review" index={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

function ClusterRow({ item, type, index }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${meta.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {type === "review" ? `Review ${index}` : meta.label}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
        <p className="text-xs text-gray-400">/blog/{item.slug}</p>
      </div>
      <a
        href={`/blog/${item.slug}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold flex-shrink-0"
      >
        View <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}