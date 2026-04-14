import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useEffect } from "react";
import NewsletterBox from "../components/blog/NewsletterBox";
import Breadcrumb from "../components/blog/Breadcrumb";
import { ShieldCheck, Star, Package, Zap, BookOpen, Users, ArrowRight } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.title = "About DanFinds — Who We Are & How We Review Products";
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement("meta"); desc.name = "description"; document.head.appendChild(desc); }
    desc.setAttribute("content", "Meet Dan, the person behind DanFinds. Learn how we research and test Amazon products, what our editorial standards are, and why thousands of shoppers trust our recommendations.");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[{ label: "About" }]} />
          <h1 className="text-4xl font-extrabold mt-4">About DanFinds</h1>
          <p className="text-gray-400 mt-2 text-lg">The story, the standards, and the person behind every review</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Origin story */}
        <div className="flex flex-col md:flex-row gap-10 mb-14">
          <div className="flex-shrink-0 flex items-start justify-center md:justify-start">
            <div className="w-24 h-24 rounded-2xl bg-amber-100 flex items-center justify-center text-5xl select-none">👋</div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hey, I'm Dan</h2>
            <div className="prose text-gray-700 space-y-4 leading-relaxed">
              <p>
                I started DanFinds in 2022 after one too many frustrating Amazon purchases. A $60 "highly rated" yoga mat that smelled like a tire factory. A phone stand that collapsed under the weight of my phone. A power bank that took three hours to charge my phone to 40%.
              </p>
              <p>
                Sound familiar? The problem isn't Amazon — it's that the review ecosystem there is broken. Fake reviews, incentivized 5-star ratings, and keyword-stuffed product titles make it nearly impossible to figure out what's actually worth buying.
              </p>
              <p>
                So I took a different approach. I started digging through real reviews — the ones with photos, detailed complaints, long-term updates. I started cross-referencing against third-party testing data when it existed. And eventually, I started buying products myself and spending real time with them before writing a single word.
              </p>
              <p>
                DanFinds is the resource I wish had existed when I started. Every list, comparison, and review here comes from genuine research and real opinions — including the honest "this disappointed me" ones.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {[
            { stat: "150+", label: "Posts Published", desc: "Across fitness, home, tech, and everyday carry" },
            { stat: "10K+", label: "Monthly Readers", desc: "Shoppers who trust our recommendations" },
            { stat: "100%", label: "Independent", desc: "No brand sponsorships or paid placements — ever" }
          ].map((item, i) => (
            <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
              <div className="text-3xl font-extrabold text-amber-600">{item.stat}</div>
              <div className="font-bold text-gray-900 mt-1">{item.label}</div>
              <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Editorial standards */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Editorial Standards</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Every product recommendation on DanFinds goes through a consistent research and evaluation process. We don't accept free products in exchange for positive reviews, and no brand has ever paid to appear in our lists. Here's exactly how we work:
          </p>
          <div className="space-y-5">
            {[
              { icon: BookOpen, step: "01", title: "Deep Research First", desc: "Before buying anything, we read hundreds of verified customer reviews on Amazon, cross-reference third-party testing sources, and identify the most common problems and praises for each product category. We're looking for patterns — not outliers." },
              { icon: Package, step: "02", title: "Real-World Testing", desc: "For key categories, we personally purchase and use products over days or weeks — not just unboxing them. We test resistance bands during actual workouts, organize cables with actual cable management products, and charge devices with the power banks we recommend." },
              { icon: Star, step: "03", title: "Honest Comparison", desc: "We evaluate products side-by-side on criteria that actually matter to you: build quality, ease of use, value for the price, durability, and whether the product description matched reality. We're just as likely to tell you why something didn't make the cut as why something did." },
              { icon: ShieldCheck, step: "04", title: "Transparent Writing", desc: "Our reviews include real pros and cons — not just marketing language. We highlight specific failure modes, who the product is right for, and who should look elsewhere. If a product disappointed us in testing, we say so clearly." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-500 font-mono">{item.step}</span>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What we cover */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Cover</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            DanFinds focuses on the everyday product categories where bad purchases hurt the most — gear you use daily, items that need to hold up over time, and purchases where the price-to-quality ratio actually matters.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: "💪", label: "Fitness Gear", desc: "Resistance bands, jump ropes, yoga mats, workout accessories" },
              { emoji: "🔌", label: "Tech Accessories", desc: "Cables, chargers, power banks, phone stands, desk gadgets" },
              { emoji: "🏠", label: "Home Organization", desc: "Pantry, closet, under-sink, and bathroom storage solutions" },
              { emoji: "💰", label: "Deals Under $50", desc: "High-value picks that won't break the bank" },
              { emoji: "📦", label: "Amazon Finds", desc: "Hidden gems and underrated products worth knowing about" },
              { emoji: "⭐", label: "Product Reviews", desc: "Deep-dive single-product reviews for major purchase decisions" },
            ].map(cat => (
              <div key={cat.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <div className="font-bold text-gray-900 text-sm">{cat.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How we make money */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">How DanFinds Makes Money</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            DanFinds participates in the Amazon Associates affiliate program. When you click a link to Amazon from this site and complete a purchase, we earn a small commission — typically 1–4% depending on the category.
          </p>
          <p className="text-gray-600 leading-relaxed mb-3">
            This commission comes at <strong>no extra cost to you</strong>. The price you see on Amazon is the same whether you arrive through DanFinds or type Amazon.com directly.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This model works <em>because</em> our recommendations have to be good. If we point you toward a bad product, you don't come back. The only way affiliate income is sustainable is if our reviews are genuinely useful. That's the alignment of incentives that makes this model honest.
          </p>
          <Link to={createPageUrl("AffiliateDisclosure")} className="inline-flex items-center gap-1 text-amber-600 font-semibold hover:underline mt-3 text-sm">
            Read our full affiliate disclosure <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Contact CTA */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Have a question or product suggestion?</h2>
            <p className="text-gray-600 text-sm">I read every message and reply to most within a day or two.</p>
          </div>
          <Link to={createPageUrl("Contact")} className="flex-shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors whitespace-nowrap">
            Get in Touch
          </Link>
        </div>

        <NewsletterBox source="about-page" />
      </div>
    </div>
  );
}