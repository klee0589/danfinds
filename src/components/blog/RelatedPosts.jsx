import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PostCard from "./PostCard";

export default function RelatedPosts({ currentSlug, category, tags = [] }) {
  const { data: posts = [] } = useQuery({
    queryKey: ["related-posts", currentSlug],
    queryFn: () => base44.entities.BlogPost.list("-created_date", 50),
    enabled: !!currentSlug
  });

  // Score posts by relevance: same category = 2pts, shared tag = 1pt each
  const candidates = posts
    .filter(p => p.slug !== currentSlug)
    .map(p => {
      let score = 0;
      if (p.category === category) score += 2;
      (tags || []).forEach(tag => {
        if (p.tags?.includes(tag)) score += 1;
      });
      return { ...p, _score: score };
    })
    .sort((a, b) => b._score - a._score || new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 4);

  if (candidates.length === 0) return null;

  return (
    <section className="my-12 pt-10 border-t border-gray-100">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {candidates.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}