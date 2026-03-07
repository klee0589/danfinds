import { List } from "lucide-react";

export default function TableOfContents({ products, hasFaqs, hasBuyingGuide }) {
  const items = [
    { id: "introduction", label: "Introduction" },
    { id: "quick-picks", label: "Quick Picks" },
    { id: "comparison", label: "Comparison Table" },
    ...(products || []).map((p, i) => ({ id: `product-${i}`, label: p.name })),
    ...(hasBuyingGuide ? [{ id: "buying-guide", label: "Buying Guide" }] : []),
    ...(hasFaqs ? [{ id: "faqs", label: "Frequently Asked Questions" }] : []),
    { id: "conclusion", label: "Conclusion" }
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 font-bold text-gray-900 mb-3">
        <List className="w-5 h-5 text-amber-600" />
        Table of Contents
      </div>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i}>
            <a
              href={`#${item.id}`}
              className="text-sm text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-2"
            >
              <span className="text-amber-400 font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}