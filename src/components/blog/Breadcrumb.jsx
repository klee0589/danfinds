import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
      <Link to={createPageUrl("Home")} className="flex items-center gap-1 hover:text-amber-600 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          {item.href ? (
            <Link to={item.href} className="hover:text-amber-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}