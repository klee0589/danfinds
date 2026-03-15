import { useEffect, useRef } from "react";

export default function AdSenseAd({ className = "" }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (adRef.current && adRef.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      // silently ignore
    }
  }, []);

  return (
    <div className={`overflow-hidden text-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9420381871665480"
        data-ad-slot="7771789866"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}