import { Mail, Gift, Star, Shield } from "lucide-react";
import NewsletterBox from "../components/blog/NewsletterBox";
import Breadcrumb from "../components/blog/Breadcrumb";

export default function Newsletter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Breadcrumb items={[{ label: "Newsletter" }]} />

        <div className="text-center mt-8 mb-10">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Get the Best Amazon Finds Every Week</h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Join 10,000+ smart shoppers who never miss a deal. Weekly curated product reviews, hidden gems, and limited-time Amazon finds — direct to your inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Gift, title: "Exclusive Finds", desc: "Products I discover before they go viral" },
            { icon: Star, title: "Top Picks Only", desc: "Only 4.5+ star products make the cut" },
            { icon: Shield, title: "Zero Spam", desc: "One email per week, max. Unsubscribe anytime." }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm">
              <item.icon className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <NewsletterBox source="newsletter-page" />

        <div className="text-center mt-8 text-sm text-gray-400">
          By subscribing, you agree to receive weekly emails from DanFinds. We respect your privacy and will never share your email. <br />
          Emails may contain Amazon affiliate links.
        </div>
      </div>
    </div>
  );
}