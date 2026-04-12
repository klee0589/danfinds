import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Legacy redirect: /BlogPost?slug=foo -> /blog/foo
 * Also injects a canonical link so Google transfers index credit to the /blog/ URL.
 */
export default function BlogPost() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    // Inject canonical pointing to the correct /blog/ URL
    if (slug) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `https://danfinds.online/blog/${slug}`;
    }

    if (slug) {
      navigate(`/blog/${slug}`, { replace: true });
    } else {
      navigate("/Blog", { replace: true });
    }
  }, [navigate]);

  return null;
}