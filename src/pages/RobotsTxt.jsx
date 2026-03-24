import { useEffect } from "react";

export default function RobotsTxt() {
  useEffect(() => {
    document.title = "robots.txt";
    // Noindex this utility page
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow';
    return () => { if (meta) meta.content = 'index, follow'; };
  }, []);

  const content = `User-agent: *
Allow: /
Disallow: /AdsTxt
Disallow: /RobotsTxt
Disallow: /SitemapXml
Disallow: /AdminPipeline
Disallow: /AdminTrends
Disallow: /AdminProducts
Disallow: /AdminGenerate
Disallow: /AdminQueue
Disallow: /AdminCluster
Disallow: /AdminKeywords
Disallow: /AdminFixImages

Sitemap: https://danfinds.online/sitemap.xml`;

  return (
    <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", padding: "1rem" }}>
      {content}
    </pre>
  );
}