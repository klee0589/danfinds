export default function AuthorBox({ author, author_bio, author_avatar }) {
  return (
    <div className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 my-8">
      <img
        src={author_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"}
        alt={author}
        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        loading="lazy"
      />
      <div>
        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Written by</p>
        <h4 className="font-bold text-gray-900 text-lg">{author}</h4>
        <p className="text-gray-600 text-sm mt-1">{author_bio}</p>
        <p className="text-xs text-gray-400 mt-2">✅ All products are independently reviewed. Affiliate links help support DanFinds at no extra cost to you.</p>
      </div>
    </div>
  );
}