"use client";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-[140px] px-4 pb-12 sm:px-6 sm:pb-16 lg:px-[50px] lg:pb-20">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm uppercase tracking-wider text-[#666] mb-4">
            BabyFictions
          </p>
          <h1 className="font-[family-name:var(--font-headers)] text-[36px] leading-[32px] sm:text-[44px] sm:leading-[40px] lg:text-[52px] lg:leading-[48px] tracking-[1px] uppercase mb-6">
            Privacy Policy
          </h1>
          <div className="w-full h-[2px] bg-black mx-auto" />
        </div>

        {/* Last Updated */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <p className="font-[family-name:var(--font-body)] text-sm italic text-[#666]">
            Last Updated: November 10, 2025
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8 sm:mb-10">
          <p className="font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-black mb-4">
            This Privacy Policy describes how BabyFictions ("we", "us", "our") collects, uses, and protects your personal information in compliance with the Protection of Personal Information Act (POPIA) of South Africa.
          </p>
        </div>

        {/* Privacy Content */}
        <div className="space-y-8 sm:space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>We may collect the following personal information when you visit or use our website:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, surname, and contact details</li>
                <li>Email address</li>
                <li>Shipping and billing address</li>
                <li>Payment details (processed securely by third-party payment providers)</li>
                <li>Device information and browsing behaviour via cookies</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              2. How We Use Your Information
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and deliver your orders</li>
                <li>Communicate with you about your purchase or account</li>
                <li>Send marketing emails (only if you've opted in)</li>
                <li>Improve our website and shopping experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              3. Cookies
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                Our site uses cookies to enhance your experience. You can choose to disable cookies in your browser, but some features may not function properly as a result.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              4. Data Sharing
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>We do not sell or rent your personal data.</strong>
              </p>
              <p>We may share your information only with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Courier and logistics partners (for delivery)</li>
                <li>Secure payment processors (for transactions)</li>
                <li>Service providers assisting with our website or marketing operations</li>
              </ul>
              <p>All third parties are bound by confidentiality agreements and POPIA compliance standards.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              5. Data Protection
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                We use industry-standard measures to protect your personal data from unauthorized access, alteration, or disclosure.
              </p>
              <p>
                All transactions are encrypted via SSL (Secure Socket Layer) technology.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              6. Your Rights Under POPIA
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access to the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Lodge a complaint with the Information Regulator (South Africa) if you believe your data has been misused</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              7. Data Retention
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                We retain your personal information only as long as necessary to fulfil the purposes outlined in this policy or as required by law.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              8. Third-Party Links
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                Our website may contain links to third-party sites. We are not responsible for the privacy practices or content of these websites.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              9. Changes to This Policy
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                We may update this Privacy Policy from time to time. The latest version will always be available on this page.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              10. Contact Us
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>If you have questions about this Privacy Policy or how your data is handled, contact us at:</p>
              <ul className="space-y-2 pl-6">
                <li>
                  <strong> Email:</strong>{' '}
                  <a href="mailto:privacy@babyfictions.co.za" className="underline hover:opacity-70">
                    privacy@babyfictions.co.za
                  </a>
                </li>
                <li>
                  <strong> Phone:</strong> 705-742-3221
                </li>
                <li>
                  <strong> Address:</strong> 152A Charlotte Street, Peterborough ON, South Africa
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-[#e0e0e0]">
          <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm text-center text-[#999] italic">
            We are committed to protecting your privacy and ensuring your data is handled in compliance with South African law (POPIA).
          </p>
        </div>
      </div>
    </main>
  );
}
