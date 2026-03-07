import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQSection({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faqs" className="my-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
              {openIndex === i ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-5 py-4 bg-amber-50 border-t border-gray-100">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}