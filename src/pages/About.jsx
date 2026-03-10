import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import NewsletterBox from "../components/blog/NewsletterBox";
import Breadcrumb from "../components/blog/Breadcrumb";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[{ label: "About" }]} />
          <h1 className="text-4xl font-extrabold mt-4">About DanFinds</h1>
          <p className="text-gray-400 mt-2">The story behind the site</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-10 mb-12">
          <div className="flex-shrink-0">
            





          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Hey, I'm Dan 👋</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>I started DanFinds after spending way too much money on Amazon products that didn't live up to their listings. Misleading photos, fake reviews, and vague descriptions had cost me hundreds of dollars in returns.</p>
              <p>So I decided to do the work myself. I started buying, testing, and comparing products across dozens of categories — fitness gear, home organization, tech accessories, and everything in between — and writing up honest, detailed reviews.</p>
              <p>DanFinds is the resource I wish had existed when I first started shopping on Amazon. Every review you read here comes from real testing, real research, and real opinions — good and bad.</p>
              <p>If it made the cut on this site, it's because it genuinely impressed me.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
          { stat: "25+", label: "Reviews Published", desc: "Covering fitness, home, tech, and more" },
          { stat: "10K+", label: "Monthly Readers", desc: "Helping shoppers make better decisions" },
          { stat: "100%", label: "Independent", desc: "No brand sponsorships or paid placements" }].
          map((item, i) =>
          <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
              <div className="text-3xl font-extrabold text-amber-600">{item.stat}</div>
              <div className="font-bold text-gray-900 mt-1">{item.label}</div>
              <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How I Review Products</h2>
          <div className="space-y-4">
            {[
            { step: "01", title: "Research", desc: "I start by reading hundreds of real customer reviews, identifying common praise and complaints." },
            { step: "02", title: "Purchase & Test", desc: "I buy the top contenders and test them in real-world conditions over several days or weeks." },
            { step: "03", title: "Compare", desc: "I compare products side-by-side across key criteria relevant to how you'll actually use them." },
            { step: "04", title: "Write Honestly", desc: "I write up the pros, cons, and my honest verdict — including when a product disappointed me." }].
            map((item, i) =>
            <div key={i} className="flex gap-4">
                <span className="text-2xl font-extrabold text-amber-200 flex-shrink-0 font-mono">{item.step}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Affiliate Disclosure</h2>
          <p className="text-gray-600">DanFinds participates in the Amazon Associates program. When you click affiliate links and make a purchase, I earn a small commission at no extra cost to you. This helps keep the site running and free to read. <Link to={createPageUrl("AffiliateDisclosure")} className="text-amber-600 font-semibold hover:underline">Read the full disclosure →</Link></p>
        </div>

        <NewsletterBox source="about-page" />
      </div>
    </div>);

}