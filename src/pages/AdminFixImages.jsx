import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ImageIcon, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFixImages() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    base44.entities.BlogPost.list("-created_date", 100).then(setPosts).finally(() => setLoading(false));
  }, []);

  async function fixPost(post) {
    const key = post.id;
    setProgress(p => ({ ...p, [key]: { status: "running", done: 0, total: 1 + (post.products?.length || 0) } }));

    // Fix featured image
    await base44.functions.invoke("fixExistingImages", { post_id: post.id, type: "featured" });
    setProgress(p => ({ ...p, [key]: { ...p[key], done: 1 } }));

    // Fix each product image
    for (let i = 0; i < (post.products?.length || 0); i++) {
      await base44.functions.invoke("fixExistingImages", { post_id: post.id, type: "product", product_index: i });
      setProgress(p => ({ ...p, [key]: { ...p[key], done: i + 2 } }));
    }

    setProgress(p => ({ ...p, [key]: { ...p[key], status: "done" } }));
    // Refresh posts
    base44.entities.BlogPost.list("-created_date", 100).then(setPosts);
  }

  const hasBrokenImage = (post) =>
    post.featured_image?.includes("m.media-amazon.com") || !post.featured_image ||
    post.products?.some(p => p.image?.includes("m.media-amazon.com") || !p.image);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-bold">Fix Broken Images</h1>
        </div>
        <Button
          onClick={async () => {
            setBulkRunning(true);
            setBulkResult(null);
            const res = await base44.functions.invoke("fixAllMissingImages", {});
            setBulkResult(res.data);
            setBulkRunning(false);
            base44.entities.BlogPost.list("-created_date", 100).then(setPosts);
          }}
          disabled={bulkRunning}
          className="bg-gray-900 hover:bg-gray-700 text-white"
        >
          {bulkRunning ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" />Fixing All...</> : "Fix All Missing Images"}
        </Button>
      </div>
      {bulkResult && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          ✓ Fixed {bulkResult.images_fixed} images across {bulkResult.posts_checked} posts
          {bulkResult.images_failed > 0 && ` (${bulkResult.images_failed} failed)`}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading posts...</p>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const broken = hasBrokenImage(post);
            const prog = progress[post.id];
            return (
              <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <img
                  src={post.featured_image}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {post.products?.length || 0} products
                    {broken ? <span className="text-red-500 ml-2">⚠ Has broken images</span> : <span className="text-green-600 ml-2">✓ Images OK</span>}
                  </p>
                  {prog && (
                    <div className="mt-1">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${(prog.done / prog.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {prog.status === "done" ? "Done!" : `${prog.done}/${prog.total} images...`}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={prog?.status === "running" || prog?.status === "done"}
                  onClick={() => fixPost(post)}
                  className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {prog?.status === "done" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : prog?.status === "running" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Fix Images"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}