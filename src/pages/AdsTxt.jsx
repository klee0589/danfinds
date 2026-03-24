import { useEffect } from "react";

export default function AdsTxt() {
  useEffect(() => {
    document.title = "ads.txt";
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow';
    return () => { if (meta) meta.content = 'index, follow'; };
  }, []);

  return (
    <pre style={{ fontFamily: "monospace", padding: "20px", margin: 0, whiteSpace: "pre-wrap" }}>
      google.com, pub-9420381871665480, DIRECT, f08c47fec0942fa0
    </pre>
  );
}