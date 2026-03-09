import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Menu, X, ShoppingBag, ArrowLeft, Home as HomeIcon, BookOpen, Grid3x3 } from "lucide-react";
import { useState, useEffect } from "react";

// Inject AdSense script once
function useAdSense() {
  useEffect(() => {
    // Add meta tag for AdSense verification
    if (!document.querySelector('meta[name="google-adsense-account"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google-adsense-account';
      meta.content = 'ca-pub-9420381871665480';
      document.head.appendChild(meta);
    }
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
  { label: "Newsletter", page: "Newsletter" },
  { label: "Contact", page: "Contact" }
];

const ADMIN_PAGES = ["AdminPipeline","AdminTrends","AdminProducts","AdminGenerate","AdminQueue","AdminFixImages"];

export default function Layout({ children, currentPageName }) {
  useAdSense();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSubPage = ["BlogPost", "Categories", "About", "Contact"].includes(currentPageName);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col font-sans">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; overscroll-behavior-y: none; }
      `}</style>

      {/* Top Bar */}
      <div className="bg-amber-500 text-white text-xs text-center py-2 px-4 font-medium">
        🛍️ We may earn commissions on Amazon purchases — at no extra cost to you. <Link to={createPageUrl("AffiliateDisclosure")} className="underline ml-1">Learn more</Link>
      </div>

      {/* Header */}
      <header className="bg-background dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {isSubPage && (
            <button onClick={() => window.history.back()} className="mr-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors md:hidden select-none">
              <ArrowLeft className="w-5 h-5 text-foreground dark:text-gray-300" />
            </button>
          )}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 flex-shrink-0 select-none">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-foreground dark:text-white">Dan<span className="text-amber-500">Finds</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className={`text-sm font-medium transition-colors hover:text-amber-600 select-none dark:hover:text-amber-400 ${currentPageName === link.page ? "text-amber-600 dark:text-amber-400" : "text-foreground dark:text-gray-300"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {ADMIN_PAGES.includes(currentPageName) && (
              <Link to={createPageUrl("AdminPipeline")} className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors select-none">
                ⚡ Pipeline
              </Link>
            )}
            <Link to={createPageUrl("Blog")} className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors select-none">
              <Search className="w-4 h-4" /> Search Deals
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-foreground dark:text-gray-300 select-none">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-background dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 pb-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-foreground dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 border-b border-gray-100 dark:border-gray-800 select-none"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 mb-20 md:mb-0">
        {children}
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: HomeIcon, label: "Home", page: "Home" },
          { icon: BookOpen, label: "Blog", page: "Blog" },
          { icon: Grid3x3, label: "Categories", page: "Categories" }
        ].map(({ icon: Icon, label, page }) => (
          <Link
            key={page}
            to={createPageUrl(page)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors select-none ${
              currentPageName === page
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-300"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-16 md:mt-16 mt-24">
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
                  <Link to={createPageUrl(link.page)} className="hover:text-amber-400 transition-colors select-none">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-300">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {["Fitness Gear", "Tech Accessories", "Home Organization", "Deals Under $50"].map(cat => (
                 <li key={cat}>
                   <Link to={createPageUrl(`Categories?cat=${encodeURIComponent(cat)}`)} className="hover:text-amber-400 transition-colors select-none">{cat}</Link>
                 </li>
               ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-300">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to={createPageUrl("AffiliateDisclosure")} className="hover:text-amber-400 transition-colors select-none">Affiliate Disclosure</Link></li>
              <li><Link to={createPageUrl("PrivacyPolicy")} className="hover:text-amber-400 transition-colors select-none">Privacy Policy</Link></li>
              <li><Link to={createPageUrl("About")} className="hover:text-amber-400 transition-colors select-none">About Dan</Link></li>
              <li><Link to={createPageUrl("Contact")} className="hover:text-amber-400 transition-colors select-none">Contact</Link></li>
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