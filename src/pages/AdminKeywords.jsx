import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Search, ArrowLeft, Zap, Layers, CheckCircle, Clock, AlertCircle,
  TrendingUp, Play, Trash2, RefreshCw, ChevronUp, ChevronDown, Eye,
  Plus, BarChart2, Filter
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

const NICHES = [
  "Apple accessories", "travel tech", "desk gadgets", "home organization",
  "kitchen organization", "small apartment gadgets", "cable management", "MagSafe accessories"
];

const STATUS_META = {
  discovered: { label: "Discovered", color: "bg-gray-100 text-gray-600", icon: Eye },
  approved:   { label: "Approved",   color: "bg-blue-100 text-blue-700",  icon: CheckCircle },
  queued:     { label: "Queued",     color: "bg-amber-100 text-amber-700", icon: Clock },
  generating: { label: "Generating", color: "bg-purple-100 text-purple-700", icon: RefreshCw },
  completed:  { label: "Completed",  color: "bg-green-100 text-green-700", icon: CheckCircle },
  skipped:    { label: "Skipped",    color: "bg-red-100 text-red-600",    icon: AlertCircle },
};

const POTENTIAL_META = {
  low:       "text-gray-500",
  medium:    "text-blue-600",
  high:      "text-amber-600 font-semibold",
  very_high: "text-green-600 font-bold",
};

const INTENT_LABELS = {
  best_x_for_y:       "Best X for Y",
  best_x_under_price: "Best X Under $",
  how_to_organize:    "How to Organize",
  how_to_store:       "How to Store",
  product_review:     "Product Review",
  comparison:         "Comparison",
};

export default function AdminKeywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [runningAuto, setRunningAuto] = useState(false);
  const [autoResult, setAutoResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNiche, setFilterNiche] = useState("all");
  const [sortField, setSortField] = useState("estimated_volume");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [discoverCount, setDiscoverCount] = useState(15);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.KeywordOpportunity.list('-created_date', 500);
    setKeywords(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total:     keywords.length,
    approved:  keywords.filter(k => k.status === 'approved').length,
    queued:    keywords.filter(k => k.status === 'queued').length,
    completed: keywords.filter(k => k.status === 'completed').length,
    generating: keywords.filter(k => k.status === 'generating').length,
  };

  // ── Filtering & sorting ────────────────────────────────────────────────────
  const filtered = keywords
    .filter(k => filterStatus === 'all' || k.status === filterStatus)
    .filter(k => filterNiche === 'all' || k.niche === filterNiche)
    .sort((a, b) => {
      const av = a[sortField] ?? 0, bv = b[sortField] ?? 0;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const uniqueNiches = [...new Set(keywords.map(k => k.niche).filter(Boolean))];

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(k => k.id)));
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function discover() {
    setDiscovering(true);
    setError("");
    const res = await base44.functions.invoke('discoverKeywords', { count: discoverCount });
    if (res.data?.success) await load();
    else setError(res.data?.error || 'Discovery failed');
    setDiscovering(false);
  }

  async function bulkStatus(status) {
    await Promise.all([...selectedIds].map(id =>
      base44.entities.KeywordOpportunity.update(id, { status })
    ));
    setSelectedIds(new Set());
    await load();
  }

  async function deleteSelected() {
    await Promise.all([...selectedIds].map(id =>
      base44.entities.KeywordOpportunity.delete(id)
    ));
    setSelectedIds(new Set());
    await load();
  }

  async function runAutoGenerate() {
    setRunningAuto(true);
    setAutoResult(null);
    const res = await base44.functions.invoke('autoGenerateClusters', {});
    setAutoResult(res.data);
    setRunningAuto(false);
    await load();
  }

  async function generateClusterForKeyword(kw) {
    await base44.entities.KeywordOpportunity.update(kw.id, { status: 'generating' });
    await load();
    const res = await base44.functions.invoke('generateCluster', { keyword: kw.keyword, category: kw.category });
    if (res.data?.success) {
      const cluster = res.data.cluster;
      const allSlugs = [
        cluster.list?.slug,
        cluster.guide?.slug,
        ...(cluster.reviews || []).map(r => r.slug)
      ].filter(Boolean);
      await base44.entities.KeywordOpportunity.update(kw.id, {
        status: 'completed',
        cluster_id: cluster.list?.id || '',
        cluster_slugs: allSlugs,
        generated_at: new Date().toISOString()
      });
    } else {
      await base44.entities.KeywordOpportunity.update(kw.id, { status: 'approved', notes: res.data?.error || 'Failed' });
    }
    await load();
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-amber-500" />
      : <ChevronDown className="w-3 h-3 text-amber-500" />;
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl("AdminPipeline")} className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-amber-500" /> Keyword Discovery & Cluster Queue
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Find low-competition keywords → approve → auto-generate 7-article clusters</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Keywords", value: stats.total,     color: "text-gray-700",   bg: "bg-gray-50"   },
            { label: "Approved",       value: stats.approved,  color: "text-blue-700",   bg: "bg-blue-50"   },
            { label: "Queued",         value: stats.queued,    color: "text-amber-700",  bg: "bg-amber-50"  },
            { label: "Generating",     value: stats.generating,color: "text-purple-700", bg: "bg-purple-50" },
            { label: "Completed",      value: stats.completed, color: "text-green-700",  bg: "bg-green-50"  },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Discover */}
          <div className="flex gap-2 items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <label className="text-xs font-semibold text-gray-600">Keywords:</label>
            <select
              value={discoverCount}
              onChange={e => setDiscoverCount(Number(e.target.value))}
              className="text-sm border-none outline-none bg-transparent font-medium text-gray-800"
            >
              {[10, 15, 20, 30].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={discover}
              disabled={discovering}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
            >
              {discovering
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Discovering...</>
                : <><TrendingUp className="w-3.5 h-3.5" /> Discover Keywords</>
              }
            </button>
          </div>

          {/* Auto-generate */}
          <button
            onClick={runAutoGenerate}
            disabled={runningAuto || stats.queued === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {runningAuto
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating clusters...</>
              : <><Zap className="w-4 h-4" /> Run Auto-Generate ({stats.queued} queued)</>
            }
          </button>

          {/* Bulk actions (visible when selection active) */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-3 py-2">
              <span className="text-white text-xs font-semibold">{selectedIds.size} selected</span>
              <button onClick={() => bulkStatus('approved')} className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">Approve</button>
              <button onClick={() => bulkStatus('queued')}   className="text-xs px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold">Queue</button>
              <button onClick={() => bulkStatus('skipped')}  className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold">Skip</button>
              <button onClick={deleteSelected}              className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-1"><Trash2 className="w-3 h-3" /></button>
            </div>
          )}
        </div>

        {/* Auto-generate result */}
        {autoResult && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${autoResult.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
            {autoResult.error
              ? <><AlertCircle className="w-4 h-4" /> Error: {autoResult.error}</>
              : <><CheckCircle className="w-4 h-4" /> Generated {autoResult.generated?.length || 0} cluster(s). {autoResult.errors?.length > 0 && `${autoResult.errors.length} error(s).`}</>
            }
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1 flex-wrap">
            {['all', ...Object.keys(STATUS_META)].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {s === 'all' ? 'All Statuses' : STATUS_META[s].label}
              </button>
            ))}
          </div>
          {uniqueNiches.length > 0 && (
            <select
              value={filterNiche}
              onChange={e => setFilterNiche(e.target.value)}
              className="ml-auto text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">All Niches</option>
              {uniqueNiches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 opacity-40" />
              <p className="text-sm">Loading keywords...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-gray-600 mb-1">No keywords yet</p>
              <p className="text-sm mb-4">Click "Discover Keywords" to find low-competition SEO opportunities.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="accent-amber-500" />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer" onClick={() => toggleSort('keyword')}>
                      <span className="flex items-center gap-1">Keyword <SortIcon field="keyword" /></span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Niche</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Intent</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer" onClick={() => toggleSort('estimated_difficulty')}>
                      <span className="flex items-center gap-1">KD <SortIcon field="estimated_difficulty" /></span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer" onClick={() => toggleSort('estimated_volume')}>
                      <span className="flex items-center gap-1">Vol <SortIcon field="estimated_volume" /></span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer" onClick={() => toggleSort('affiliate_potential')}>
                      <span className="flex items-center gap-1">Potential <SortIcon field="affiliate_potential" /></span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(kw => {
                    const statusMeta = STATUS_META[kw.status] || STATUS_META.discovered;
                    const StatusIcon = statusMeta.icon;
                    return (
                      <tr key={kw.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(kw.id) ? 'bg-amber-50' : ''}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedIds.has(kw.id)} onChange={() => toggleSelect(kw.id)} className="accent-amber-500" />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{kw.keyword}</p>
                          {kw.notes && <p className="text-xs text-gray-400 truncate max-w-xs">{kw.notes}</p>}
                          {kw.status === 'completed' && kw.cluster_slugs?.[0] && (
                            <a href={`/blog/${kw.cluster_slugs[0]}`} target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:underline">
                              View cluster →
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kw.niche || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {INTENT_LABELS[kw.intent_type] || kw.intent_type || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <DifficultyBadge value={kw.estimated_difficulty} />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {kw.estimated_volume ? kw.estimated_volume.toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium capitalize ${POTENTIAL_META[kw.affiliate_potential] || 'text-gray-500'}`}>
                            {kw.affiliate_potential?.replace('_', ' ') || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.color}`}>
                            <StatusIcon className={`w-3 h-3 ${kw.status === 'generating' ? 'animate-spin' : ''}`} />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <KeywordActions kw={kw} onUpdate={load} onGenerate={generateClusterForKeyword} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workflow guide */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-amber-500" /> How to Use the Keyword Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Discover", desc: "AI finds 10–20 low-competition keywords in your target niches", color: "bg-blue-50 border-blue-200" },
              { step: "2", title: "Review", desc: "Check estimated difficulty (KD) and volume. Approve the best ones.", color: "bg-amber-50 border-amber-200" },
              { step: "3", title: "Queue", desc: "Mark approved keywords as Queued to schedule cluster generation", color: "bg-purple-50 border-purple-200" },
              { step: "4", title: "Auto-Generate", desc: "Click Run Auto-Generate (or let the daily automation do it) — up to 2 clusters/day", color: "bg-green-50 border-green-200" },
            ].map(s => (
              <div key={s.step} className={`border rounded-xl p-4 ${s.color}`}>
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-extrabold flex items-center justify-center mb-2">{s.step}</div>
                <p className="font-bold text-gray-800 text-sm mb-1">{s.title}</p>
                <p className="text-xs text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

function DifficultyBadge({ value }) {
  if (value == null) return <span className="text-gray-400 text-xs">—</span>;
  const color = value <= 15 ? 'bg-green-100 text-green-700' : value <= 25 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{value}</span>;
}

function KeywordActions({ kw, onUpdate, onGenerate }) {
  const [busy, setBusy] = useState(false);

  async function setStatus(status) {
    setBusy(true);
    await base44.entities.KeywordOpportunity.update(kw.id, { status });
    await onUpdate();
    setBusy(false);
  }

  if (kw.status === 'completed') {
    return (
      <div className="flex gap-1">
        <Link to={createPageUrl("AdminCluster")} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-semibold">New Cluster</Link>
      </div>
    );
  }

  if (kw.status === 'generating') {
    return <span className="text-xs text-purple-600 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Working…</span>;
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {kw.status === 'discovered' && (
        <button disabled={busy} onClick={() => setStatus('approved')} className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold">Approve</button>
      )}
      {(kw.status === 'discovered' || kw.status === 'approved') && (
        <button disabled={busy} onClick={() => setStatus('queued')} className="text-xs px-2 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-semibold">Queue</button>
      )}
      {kw.status === 'approved' && (
        <button disabled={busy} onClick={() => { setBusy(true); onGenerate(kw).finally(() => setBusy(false)); }} className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1">
          <Play className="w-3 h-3" /> Generate
        </button>
      )}
      {kw.status === 'queued' && (
        <button disabled={busy} onClick={() => setStatus('approved')} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded-lg font-semibold">Unqueue</button>
      )}
      {kw.status !== 'skipped' && (
        <button disabled={busy} onClick={() => setStatus('skipped')} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-500 rounded-lg font-semibold">Skip</button>
      )}
    </div>
  );
}