import { Star, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function ComparisonTable({ products }) {
  if (!products || products.length === 0) return null;

  useEffect(() => {
    base44.analytics.track({
      eventName: "comparison_table_viewed",
      properties: { product_count: products.length }
    });
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm my-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="text-left px-4 py-3 font-semibold">Product</th>
            <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Best For</th>
            <th className="text-left px-4 py-3 font-semibold">Price</th>
            <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Rating</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-amber-50 transition-colors`}>
              <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
              <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                  {product.best_for || "General Use"}
                </span>
              </td>
              <td className="px-4 py-3 text-amber-700 font-semibold">{product.price_range}</td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{product.rating?.toFixed(1)}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3 h-3" />
                  Check Price
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}