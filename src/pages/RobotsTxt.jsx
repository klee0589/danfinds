import { useEffect } from "react";

export default function RobotsTxt() {
  useEffect(() => {
    document.title = "robots.txt";
  }, []);

  const content = `User-agent: *
Allow: /
Sitemap: https://danfinds.online/sitemap.xml`;

  return (
    <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", padding: "1rem" }}>
      {content}
    </pre>
  );
}