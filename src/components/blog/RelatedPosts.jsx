import PostCard from "./PostCard";
import { SAMPLE_POSTS } from "./blogData";

export default function RelatedPosts({ slugs }) {
  const related = (slugs || [])
    .map(slug => SAMPLE_POSTS.find(p => p.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}