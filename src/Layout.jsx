import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Menu, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";

// Inject AdSense script once
function useAdSense() {
  useEffect(() => {
    if (document.querySelector('script[data-adsense]')) return;
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9420381871665480';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adsense', 'true');
    document.head.appendChild(script);
  }, []);
}

const NAV_LINKS = [
  { label: "Home", page: "Home" },
  { label: "Blog", page: "Blog" },
  { label: "Categories", page: "Categories" },
  { label: "About", page: "About" },
  { label: "Newsletter", page: "Newsletter" }
];

const ADMIN_PAGES = ["AdminPipeline","AdminTrends","AdminProducts","AdminGenerate","AdminQueue"];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `}</style>

      {/* Top Bar */}
      <div className="bg-amber-500 text-white text-xs text-center py-2 px-4 font-medium">
        🛍️ We may earn commissions on Amazon purchases — at no extra cost to you. <Link to={createPageUrl("AffiliateDisclosure")} className="underline ml-1">Learn more</Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">Dan<span className="text-amber-500">Finds</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className={`text-sm font-medium transition-colors hover:text-amber-600 ${currentPageName === link.page ? "text-amber-600" : "text-gray-700"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {ADMIN_PAGES.includes(currentPageName) && (
              <Link to={createPageUrl("AdminPipeline")} className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors">
                ⚡ Pipeline
              </Link>
            )}
            <Link to={createPageUrl("Blog")} className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors">
              <Search className="w-4 h-4" /> Search Deals
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-700">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-gray-700 hover:text-amber-600 border-b border-gray-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold">Dan<span className="text-amber-400">Finds</span></span>
            </div>
            <p className="text-gray-400 text-sm">Honest Amazon product reviews and curated deals to help you buy smarter.</p>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-300">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {NAV_LINKS.map(link => (
                <li key={link.page}>
                  <Link to={createPageUrl(link.page)} className="hover:text-amber-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-300">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {["Fitness Gear", "Tech Accessories", "Home Organization", "Deals Under $50"].map(cat => (
                <li key={cat}>
                  <Link to={createPageUrl(`Categories?cat=${encodeURIComponent(cat)}`)} className="hover:text-amber-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-300">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to={createPageUrl("AffiliateDisclosure")} className="hover:text-amber-400 transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to={createPageUrl("PrivacyPolicy")} className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to={createPageUrl("About")} className="hover:text-amber-400 transition-colors">About Dan</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center py-6 text-xs text-gray-500 px-4">
          © {new Date().getFullYear()} DanFinds. As an Amazon Associate, we earn from qualifying purchases.
        </div>
      </footer>
    </div>
  );
}