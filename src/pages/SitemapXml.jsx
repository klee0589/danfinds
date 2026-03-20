import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const BASE_URL = "https://danfinds.online";

const STATIC_PAGES = [
  { loc: `${BASE_URL}/`, priority: "1.0", changefreq: "daily" },
  { loc: `${BASE_URL}/Blog`, priority: "0.9", changefreq: "daily" },
  { loc: `${BASE_URL}/Categories`, priority: "0.8", changefreq: "weekly" },
  { loc: `${BASE_URL}/About`, priority: "0.7", changefreq: "monthly" },
  { loc: `${BASE_URL}/Contact`, priority: "0.7", changefreq: "monthly" },
  { loc: `${BASE_URL}/Newsletter`, priority: "0.6", changefreq: "monthly" },
  { loc: `${BASE_URL}/AffiliateDisclosure`, priority: "0.4", changefreq: "yearly" },
  { loc: `${BASE_URL}/PrivacyPolicy`, priority: "0.4", changefreq: "yearly" },
];

function escapeXml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function SitemapXml() {
  const [xml, setXml] = useState("");

  useEffect(() => {
    base44.entities.BlogPost.list("-updated_date", 500).then(posts => {
      const staticEntries = STATIC_PAGES.map(p => `  <url>
    <loc>${escapeXml(p.loc)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");

      const postEntries = posts
        .filter(p => p.slug)
        .map(p => {
          const lastmod = p.updated_date ? new Date(p.updated_date).toISOString().split("T")[0] : "";
          return `  <url>
    <loc>${escapeXml(`${BASE_URL}/blog/${p.slug}`)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }).join("\n");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${postEntries}
</urlset>`;

      setXml(sitemap);

      // Serve as XML content type via a blob URL trick
      const blob = new Blob([sitemap], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      // Trigger download / display raw XML
      window.location.href = url;
    });
  }, []);

  return (
    <pre style={{ fontFamily: "monospace", fontSize: "12px", padding: "1rem", whiteSpace: "pre-wrap" }}>
      {xml || "Generating sitemap..."}
    </pre>
  );
}