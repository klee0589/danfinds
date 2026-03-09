import { Star, Check, X, ExternalLink } from "lucide-react";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-gray-300"}`}
        />
      ))}
      <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product, rank }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {rank && (
        <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 text-center">
          #{rank} TOP PICK
        </div>
      )}
      <div className="p-6">
        <div className="flex gap-4 mb-4">
          <img
            src={product.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80`}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-xl flex-shrink-0 bg-gray-100"
            loading="lazy"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{product.name}</h3>
            <StarRating rating={product.rating} />
            <p className="text-amber-600 font-semibold mt-1">{product.price_range}</p>
            {product.best_for && (
              <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Best for: {product.best_for}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{product.summary}</p>

        {product.key_features && product.key_features.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Key Features</p>
            <ul className="space-y-1">
              {product.key_features.slice(0, 3).map((f, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1.5">Pros</p>
            <ul className="space-y-1">
              {(product.pros || []).slice(0, 3).map((pro, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1.5">Cons</p>
            <ul className="space-y-1">
              {(product.cons || []).slice(0, 3).map((con, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <X className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href={product.affiliate_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Check Price on Amazon
        </a>
      </div>
    </div>
  );
}