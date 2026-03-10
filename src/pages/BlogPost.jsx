import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Legacy redirect: /BlogPost?slug=foo → /blog/foo
 */
export default function BlogPost() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (slug) {
      navigate(`/blog/${slug}`, { replace: true });
    } else {
      navigate("/Blog", { replace: true });
    }
  }, [navigate]);

  return null;
}