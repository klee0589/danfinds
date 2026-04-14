import { useEffect } from "react";
import Breadcrumb from "../components/blog/Breadcrumb";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy — DanFinds";
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement("meta"); desc.name = "description"; document.head.appendChild(desc); }
    desc.setAttribute("content", "DanFinds Privacy Policy — how we collect, use, and protect your personal information including email subscriptions, cookies, and third-party services.");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: "Privacy Policy" }]} />
          <h1 className="text-3xl font-extrabold mt-4">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">How DanFinds collects, uses, and protects your information</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-gray-700">

        <p className="text-gray-500 text-sm">Effective date: April 2026. This policy applies to danfinds.online and all associated content.</p>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="leading-relaxed mb-3">
            DanFinds collects minimal personal information. The types of data we may collect include:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong className="text-gray-800">Email address:</strong> Collected when you voluntarily subscribe to our newsletter. This is the only personally identifiable information we store.</li>
            <li><strong className="text-gray-800">Contact form data:</strong> If you submit a message via our Contact page, we temporarily receive your name, email address, and message content in order to respond to you.</li>
            <li><strong className="text-gray-800">Usage data:</strong> We may collect anonymous, aggregated data about how visitors use the site (e.g., which pages are visited most, referral sources) via analytics tools. This data cannot be used to identify you personally.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong className="text-gray-800">Newsletter emails:</strong> Your email address is used solely to send the DanFinds weekly newsletter. We will never sell, share, rent, or trade your email address to any third party for marketing purposes.</li>
            <li><strong className="text-gray-800">Contact responses:</strong> Contact form submissions are used only to respond to your message. We do not add contact form submitters to marketing lists without explicit consent.</li>
            <li><strong className="text-gray-800">Site improvement:</strong> Aggregated, anonymized usage data helps us understand which content is most useful so we can improve it.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies</h2>
          <p className="leading-relaxed mb-3">
            DanFinds uses cookies — small text files stored in your browser — to improve your browsing experience. Types of cookies we may use:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong className="text-gray-800">Essential cookies:</strong> Required for basic site functionality.</li>
            <li><strong className="text-gray-800">Analytics cookies:</strong> Used to understand how visitors interact with the site (anonymous data only).</li>
            <li><strong className="text-gray-800">Advertising cookies:</strong> Google AdSense may use cookies to serve personalized ads based on your browsing history. You can opt out at <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">google.com/settings/ads</a>.</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">You can disable cookies at any time in your browser settings. Some site features may not function correctly without cookies enabled.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services</h2>
          <p className="leading-relaxed mb-3 text-sm">DanFinds uses the following third-party services, each with their own privacy practices:</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong className="text-gray-800">Amazon Associates:</strong> Affiliate links point to Amazon.com. Amazon's privacy policy governs any data collected when you click through and shop. See <a href="https://www.amazon.com/privacy" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">amazon.com/privacy</a>.</li>
            <li><strong className="text-gray-800">Google AdSense:</strong> We display ads served by Google. Google may use cookies and your browsing data to personalize ads. See <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">Google's Privacy Policy</a>.</li>
            <li><strong className="text-gray-800">Analytics:</strong> Anonymous site analytics may be collected to help us understand site performance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
          <p className="leading-relaxed text-sm">
            Newsletter subscriber email addresses are retained until you unsubscribe. Contact form data is not permanently stored beyond what is necessary to respond to your message. We do not retain personal data beyond its original purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
          <p className="leading-relaxed mb-3 text-sm">
            Depending on your jurisdiction, you may have the following rights regarding your personal data:
          </p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li>• The right to access the personal data we hold about you</li>
            <li>• The right to request correction of inaccurate data</li>
            <li>• The right to request deletion of your data</li>
            <li>• The right to withdraw consent at any time (e.g., unsubscribing from our newsletter)</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">To exercise any of these rights, contact us at <a href="mailto:dan@danfinds.app" className="text-amber-600 hover:underline">dan@danfinds.app</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
          <p className="leading-relaxed text-sm">
            DanFinds is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Unsubscribe</h2>
          <p className="leading-relaxed text-sm">
            You can unsubscribe from the DanFinds newsletter at any time by clicking the unsubscribe link at the bottom of any newsletter email, or by emailing us directly at <a href="mailto:dan@danfinds.app" className="text-amber-600 hover:underline">dan@danfinds.app</a>. Removal is processed promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
          <p className="leading-relaxed text-sm">
            We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
          <p className="text-sm text-gray-600">
            For any privacy-related questions or requests, please contact us at:{" "}
            <a href="mailto:dan@danfinds.app" className="text-amber-600 font-semibold hover:underline">dan@danfinds.app</a>
          </p>
        </section>

        <p className="text-xs text-gray-400">Last updated: April 2026</p>
      </div>
    </div>
  );
}