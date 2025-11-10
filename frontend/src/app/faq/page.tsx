"use client";
import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

type FAQ = {
  question: string;
  answer: string;
};

type FAQCategory = {
  title: string;
  id: string;
  faqs: FAQ[];
};

const faqCategories: FAQCategory[] = [
  {
    title: "Product & Sizing",
    id: "product-sizing",
    faqs: [
      {
        question: "How do I know which size to order?",
        answer: "We include detailed size guides on each product page. You can also check our \"Size Chart\" page for conversions between SA, UK, and US sizes."
      },
      {
        question: "What if my size is out of stock?",
        answer: "You can sign up to be notified when your size is restocked or contact us directly to check if we're expecting new stock soon."
      },
      {
        question: "Are your products locally made?",
        answer: "Yes, some of our items are designed and manufactured locally in South Africa. We're proud to support local craftsmanship while delivering quality streetwear."
      },
      {
        question: "Are the colours in the photos accurate?",
        answer: "We try to represent our products as accurately as possible, but colours may vary slightly due to screen settings and lighting."
      }
    ]
  },
  {
    title: "Orders & Payment",
    id: "orders-payment",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept debit/credit cards, instant EFT, SnapScan, PayFast, and PayJustNow (for split payments)."
      },
      {
        question: "Can I pay on delivery (COD)?",
        answer: "We currently do not offer cash on delivery for security reasons."
      },
      {
        question: "I didn't receive an order confirmation — what do I do?",
        answer: "Please check your spam/junk folder. If it's not there, contact our support team with your name and order details."
      }
    ]
  },
  {
    title: "Shipping & Delivery",
    id: "shipping-delivery",
    faqs: [
      {
        question: "Do you deliver nationwide?",
        answer: "Yes! We deliver anywhere in South Africa using trusted couriers."
      },
      {
        question: "How long does delivery take?",
        answer: "Standard delivery takes 2–5 business days for major cities and 5–7 days for outlying areas."
      },
      {
        question: "How much does shipping cost?",
        answer: "We offer free shipping for orders over R500, and a flat rate of R75 for smaller orders."
      },
      {
        question: "Can I track my order?",
        answer: "Yes, once your order ships, you'll receive a tracking number via email or SMS."
      }
    ]
  },
  {
    title: "Returns & Exchanges",
    id: "returns-exchanges",
    faqs: [
      {
        question: "What is your return policy?",
        answer: "You can return unworn, unused items within 7–14 days of delivery for an exchange or refund."
      },
      {
        question: "How do I request a return or exchange?",
        answer: "Visit our \"Returns\" page or email us with your order number and reason for return."
      },
      {
        question: "Do I have to pay for return shipping?",
        answer: "Return shipping is free for defective or incorrect items, but for size exchanges, the customer may be responsible for courier costs."
      }
    ]
  },
  {
    title: "Account & Support",
    id: "account-support",
    faqs: [
      {
        question: "Do I need to create an account to shop?",
        answer: "No, you can check out as a guest — but creating an account allows you to track orders and view your purchase history."
      },
      {
        question: "How can I contact customer support?",
        answer: "You can reach us via email at support@babyfictions.co.za, WhatsApp, or through our \"Contact Us\" page."
      },
      {
        question: "My order arrived damaged / incorrect — what should I do?",
        answer: "Please contact us within 48 hours with photos of the issue, and we'll resolve it promptly."
      }
    ]
  },
  {
    title: "Promotions & Loyalty",
    id: "promotions-loyalty",
    faqs: [
      {
        question: "Do you offer discounts or sales?",
        answer: "Yes, we run seasonal promotions. Sign up for our newsletter or follow us on social media to stay updated."
      },
      {
        question: "Do you have a loyalty or referral program?",
        answer: "Yes, members can earn points or rewards for every purchase and referral. Join our loyalty program to start earning today."
      }
    ]
  },
  {
    title: "General Brand",
    id: "general-brand",
    faqs: [
      {
        question: "Where is your business based?",
        answer: "We're proudly based in South Africa — Johannesburg, Gauteng."
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within South Africa, but we plan to expand soon."
      },
      {
        question: "How can I collaborate or become a brand ambassador?",
        answer: "Send us a message through our \"Contact\" page or email collab@babyfictions.co.za."
      }
    ]
  }
];

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("product-sizing");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (question: string) => {
    setOpenFAQ(openFAQ === question ? null : question);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const currentCategory = searchQuery 
    ? filteredCategories[0] 
    : faqCategories.find(cat => cat.id === activeCategory);

  return (
    <main className="min-h-screen bg-white pt-[140px] px-4 pb-12 sm:px-6 sm:pb-16 lg:px-[50px] lg:pb-20">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h1 className="font-[family-name:var(--font-headers)] text-[36px] leading-[32px] sm:text-[48px] sm:leading-[44px] lg:text-[56px] lg:leading-[50px] tracking-[1px] mb-4">
            Frequently
            <br />
            Asked Questions
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
          {/* Left Sidebar - Categories */}
          <aside className="lg:sticky lg:top-[160px] lg:self-start">
            {/* Search Bar */}
            <div className="relative mb-6 lg:mb-8">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[50px] bg-[#f5f5f5] border border-[#e0e0e0] rounded-[4px] px-4 pr-12 font-[family-name:var(--font-body)] text-sm text-black placeholder:text-[#999] outline-none focus:border-black transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* Category Navigation */}
            <nav className="space-y-2">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-4 py-3 font-[family-name:var(--font-body)] text-sm uppercase tracking-wider transition-all ${
                    activeCategory === category.id && !searchQuery
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-[#f5f5f5]'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Content - FAQ Accordion */}
          <div>
            {searchQuery && (
              <p className="font-[family-name:var(--font-body)] text-sm text-[#666] mb-6">
                Showing results for "{searchQuery}"
              </p>
            )}

            {currentCategory && currentCategory.faqs.length > 0 ? (
              <div className="space-y-4">
                {currentCategory.faqs.map((faq, index) => {
                  const faqKey = `${currentCategory.id}-${index}`;
                  const isOpen = openFAQ === faqKey;

                  return (
                    <div
                      key={faqKey}
                      className="border-b border-[#e0e0e0] last:border-b-0"
                    >
                      <button
                        onClick={() => toggleFAQ(faqKey)}
                        className="w-full flex items-start justify-between gap-4 py-5 text-left group hover:opacity-70 transition-opacity"
                      >
                        <span className="font-[family-name:var(--font-body)] text-base sm:text-lg font-medium text-black flex-1">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-[500px] opacity-100 mb-5' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p className="font-[family-name:var(--font-body)] text-sm sm:text-base text-[#666] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="font-[family-name:var(--font-body)] text-base text-[#666]">
                  No FAQs found matching your search.
                </p>
              </div>
            )}

            {/* Still Need Help Section */}
            <div className="mt-12 p-8 bg-[#f8f8f8] rounded-lg">
              <h3 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl mb-3">
                Still need help?
              </h3>
              <p className="font-[family-name:var(--font-body)] text-sm sm:text-base text-[#666] mb-6">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>
              <a
                href="/contact"
                className="inline-block bg-black text-white px-8 py-3 font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-[#333] transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
