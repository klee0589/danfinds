import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function NewsletterBox({ source = "blog", variant = "default" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await base44.entities.Subscriber.create({ email, source, subscribed_at: new Date().toISOString() });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-8 px-6 rounded-2xl bg-green-50 border border-green-200 text-center ${variant === "compact" ? "py-5" : ""}`}>
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="font-bold text-green-800 text-lg">You're in! Welcome to DanFinds.</p>
        <p className="text-green-700 text-sm">Check your inbox for your first batch of Amazon finds.</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <p className="font-bold text-gray-900 mb-1">📬 Get Weekly Amazon Finds</p>
        <p className="text-sm text-gray-600 mb-3">Join 10,000+ deal hunters. No spam, ever.</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white text-center">
      <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
      <h3 className="text-2xl font-bold mb-2">Get the Best Amazon Finds Every Week</h3>
      <p className="text-amber-100 mb-6 max-w-md mx-auto">
        Join 10,000+ smart shoppers who get our weekly roundup of deals, hidden gems, and top-rated products — straight to their inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-white"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-60"
        >
          {loading ? "Joining..." : "Subscribe Free"}
        </button>
      </form>
      <p className="text-xs text-amber-200 mt-3">No spam. Unsubscribe anytime. 100% free.</p>
    </div>
  );
}