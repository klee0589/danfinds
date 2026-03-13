import { useEffect } from "react";

export default function AdsTxt() {
  useEffect(() => {
    document.title = "ads.txt";
  }, []);

  return (
    <pre style={{ fontFamily: "monospace", padding: "20px", margin: 0, whiteSpace: "pre-wrap" }}>
      google.com, pub-9420381871665480, DIRECT, f08c47fec0942fa0
    </pre>
  );
}