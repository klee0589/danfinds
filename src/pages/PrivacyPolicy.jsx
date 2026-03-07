import Breadcrumb from "../components/blog/Breadcrumb";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: "Privacy Policy" }]} />
          <h1 className="text-3xl font-extrabold mt-4">Privacy Policy</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Information We Collect</h2>
          <p>DanFinds collects email addresses when you subscribe to our newsletter. We do not collect any other personal information.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">How We Use Your Information</h2>
          <p>Your email is used solely to send you the DanFinds weekly newsletter. We will never sell, share, or rent your email address to any third party.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cookies</h2>
          <p>This site may use cookies to improve your browsing experience. You can disable cookies in your browser settings at any time.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Third-Party Links</h2>
          <p>DanFinds contains links to Amazon and other third-party websites. We are not responsible for the privacy practices of those sites.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unsubscribe</h2>
          <p>You can unsubscribe from our newsletter at any time by clicking the unsubscribe link at the bottom of any email.</p>
        </section>
        <p className="text-sm text-gray-400">Last updated: January 2024</p>
      </div>
    </div>
  );
}