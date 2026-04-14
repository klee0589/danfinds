import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useEffect } from "react";
import Breadcrumb from "../components/blog/Breadcrumb";
import { ShieldCheck, DollarSign, ExternalLink, HelpCircle } from "lucide-react";

export default function AffiliateDisclosure() {
  useEffect(() => {
    document.title = "Affiliate Disclosure — DanFinds";
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement("meta"); desc.name = "description"; document.head.appendChild(desc); }
    desc.setAttribute("content", "Full affiliate disclosure for DanFinds. We participate in Amazon Associates and explain exactly how affiliate links work, how we earn commissions, and why it doesn't affect our editorial independence.");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: "Affiliate Disclosure" }]} />
          <h1 className="text-3xl font-extrabold mt-4">Affiliate Disclosure</h1>
          <p className="text-gray-400 mt-2">How DanFinds earns commissions — and why it doesn't change our recommendations</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-gray-700">

        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">The Short Version</h2>
          </div>
          <p className="leading-relaxed">
            DanFinds contains affiliate links to Amazon. When you click one of these links and buy something, we earn a small commission — at <strong>no extra cost to you</strong>. This income helps keep the site running and free to read. It does not influence which products we recommend or how we review them.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Amazon Associates Program</h2>
          </div>
          <p className="leading-relaxed mb-3">
            DanFinds is a participant in the <strong>Amazon Services LLC Associates Program</strong>, an affiliate advertising program designed to provide a means for websites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
          <p className="leading-relaxed mb-3">
            When you click an affiliate link on DanFinds and complete a qualifying purchase on Amazon within 24 hours, DanFinds earns a referral fee. This fee is typically between 1% and 4% of the purchase price depending on the product category.
          </p>
          <p className="leading-relaxed">
            The price you pay on Amazon is <strong>identical whether you arrive through a DanFinds link or by typing Amazon.com directly</strong>. You are never charged more because you came from our site.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">How Affiliate Links Are Used on This Site</h2>
          </div>
          <p className="leading-relaxed mb-4">
            Product links throughout DanFinds — in review articles, comparison tables, and "Top Picks" sections — are affiliate links. You can typically identify them because they link to Amazon.com and include a tracking tag in the URL.
          </p>
          <ul className="space-y-2 text-sm">
            {[
              "All affiliate links are to products we've genuinely researched or tested.",
              "We do not create content just to place affiliate links — every post serves a real reader intent.",
              "Products are selected based on quality, value, and customer satisfaction — not commission rate.",
              "We include products we believe are worth buying, not simply products with the highest affiliate payout.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">✓</span>
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Does This Affect Our Editorial Independence?</h2>
          </div>
          <p className="leading-relaxed mb-3">
            No. DanFinds does not accept free products in exchange for positive reviews, and no brand has ever paid to be featured in a list or comparison. Our editorial process is independent of our monetization.
          </p>
          <p className="leading-relaxed mb-3">
            In fact, affiliate commission rates are nearly identical across products in the same category on Amazon. Recommending a $15 product vs. a $30 product in the same niche earns us roughly the same percentage. The financial incentive isn't to push one product over another — it's to help you find something you'll actually use, so you trust our next recommendation.
          </p>
          <p className="leading-relaxed">
            We regularly include "do not buy" verdicts and negative reviews when products don't measure up. If we only published positive content, we'd lose the trust that makes this site worth visiting.
          </p>
        </section>

        <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">FTC Compliance</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This disclosure is provided in compliance with the Federal Trade Commission's guidelines on endorsements and testimonials (16 CFR Part 255). DanFinds clearly discloses its affiliate relationship with Amazon across the site — in the site footer, in a site-wide banner, and through this dedicated disclosure page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Questions?</h2>
          <p className="text-gray-600 text-sm">
            If you have any questions about how affiliate links work on this site or how we select the products we recommend,{" "}
            <Link to={createPageUrl("Contact")} className="text-amber-600 font-semibold hover:underline">
              get in touch
            </Link>
            . I'm happy to explain any part of the process.
          </p>
          <p className="text-xs text-gray-400 mt-6">Last updated: April 2026</p>
        </section>
      </div>
    </div>
  );
}