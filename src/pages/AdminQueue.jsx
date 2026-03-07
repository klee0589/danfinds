import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ClipboardList, ArrowLeft, CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react";

export default function AdminQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadQueue(); }, []);

  async function loadQueue() {
    const data = await base44.entities.PublishQueue.list('-created_date', 50);
    setQueue(data);
    setLoading(false);
  }

  async function updateStatus(id, approval_status, notes = "") {
    await base44.entities.PublishQueue.update(id, { approval_status, reviewer_notes: notes });
    setQueue(prev => prev.map(q => q.id === id ? { ...q, approval_status, reviewer_notes: notes } : q));
  }

  const filtered = filter === "all" ? queue : queue.filter(q => q.approval_status === filter);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-600 border-red-200",
    published: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("AdminPipeline")} className="text-gray-400 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-orange-500" /> Publish Queue
          </h1>
          <p className="text-sm text-gray-500">Review and approve posts before they go live</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {["all","pending","approved","published","rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s} {s !== 'all' && `(${queue.filter(q => q.approval_status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? <p className="text-center text-gray-400 py-10">Loading...</p> : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No items in queue.</p>}
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{item.post_title || "Untitled Post"}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.post_slug && <span className="text-xs font-mono text-gray-400">/{item.post_slug}</span>}
                    {item.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.category}</span>}
                    <span className="text-xs text-gray-400">{new Date(item.created_date).toLocaleDateString()}</span>
                  </div>
                  {item.reviewer_notes && (
                    <p className="text-xs text-gray-500 mt-1.5 italic">Notes: {item.reviewer_notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[item.approval_status]}`}>
                    {item.approval_status}
                  </span>
                  {item.post_slug && (
                    <Link to={createPageUrl(`BlogPost?slug=${item.post_slug}`)} className="text-gray-400 hover:text-amber-500 p-1" title="View post">
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {item.approval_status === "pending" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => updateStatus(item.id, "approved")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => {
                    const notes = prompt("Rejection reason (optional):");
                    updateStatus(item.id, "rejected", notes || "");
                  }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
              {item.approval_status === "published" && item.published_at && (
                <p className="text-xs text-gray-400 mt-2">Published: {new Date(item.published_at).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}