import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function AdminGuard({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (!user) {
          base44.auth.redirectToLogin(window.location.href);
        } else if (user.role !== "admin") {
          setStatus("forbidden");
        } else {
          setStatus("ok");
        }
      })
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  if (status === "loading") return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  if (status === "forbidden") return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-600 font-medium">Admin access required.</p>
      <Link to={createPageUrl("Home")} className="text-amber-600 underline text-sm">Back to site</Link>
    </div>
  );

  return children;
}