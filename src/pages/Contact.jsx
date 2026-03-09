import { useState } from "react";
import { Mail, MapPin, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "dan@danfinds.app",
      subject: `Contact Form: ${form.subject}`,
      body: `From: ${form.name} (${form.email})\n\n${form.message}`
    });
    setSubmitted(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Get in Touch</h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          Have a question, partnership inquiry, or just want to say hi? I'd love to hear from you.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900">Contact Info</h2>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Mail className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">Email</p>
              <a href="mailto:dan@danfinds.app" className="hover:text-amber-600 transition-colors">
                dan@danfinds.app
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <MapPin className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">Location</p>
              <p>United States</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">Response Time</p>
              <p>Usually within 1–2 business days</p>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Business Inquiries</p>
            <p>For sponsorships, brand partnerships, or product review requests, please include details in your message.</p>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600">Thanks for reaching out. I'll get back to you within 1–2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Send a Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  required
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Product review request, partnership, general question..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="Tell me what's on your mind..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl transition-colors text-sm"
              >
                {sending ? "Sending..." : "Send Message →"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}