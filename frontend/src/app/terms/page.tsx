"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pt-[140px] px-4 pb-12 sm:px-6 sm:pb-16 lg:px-[50px] lg:pb-20">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm uppercase tracking-wider text-[#666] mb-4">
            BabyFictions
          </p>
          <h1 className="font-[family-name:var(--font-headers)] text-[36px] leading-[32px] sm:text-[44px] sm:leading-[40px] lg:text-[52px] lg:leading-[48px] tracking-[1px] uppercase mb-6">
            Terms of Service
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
            Welcome to BabyFictions! These Terms of Service ("Terms") govern your use of our website{' '}
            <a href="https://babyfictions.co.za" className="underline hover:opacity-70">
              www.babyfictions.co.za
            </a>{' '}
            ("the Site") and any purchases made through it. By accessing or using our website, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8 sm:space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              1. General
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>1.1.</strong> This website is operated by BabyFictions, a South African company.
              </p>
              <p>
                <strong>1.2.</strong> Throughout the site, the terms "we", "us", and "our" refer to BabyFictions.
              </p>
              <p>
                <strong>1.3.</strong> We reserve the right to update, change or replace any part of these Terms at any time by posting updates to our website.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              2. Use of Our Website
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>2.1.</strong> You must be 18 years or older or have consent from a parent or guardian to use this website.
              </p>
              <p>
                <strong>2.2.</strong> You agree not to use our site for any unlawful purpose or to violate any laws in South Africa or internationally.
              </p>
              <p>
                <strong>2.3.</strong> We may suspend or terminate your account if we suspect any fraudulent or abusive activity.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              3. Products and Availability
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>3.1.</strong> All products are subject to availability.
              </p>
              <p>
                <strong>3.2.</strong> We reserve the right to limit quantities or discontinue products at any time.
              </p>
              <p>
                <strong>3.3.</strong> Product images are for illustration purposes only — actual colours may vary slightly due to lighting and display differences.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              4. Pricing and Payments
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>4.1.</strong> All prices are listed in South African Rand (ZAR) and include VAT where applicable.
              </p>
              <p>
                <strong>4.2.</strong> Payment can be made via accepted payment methods listed at checkout (e.g., PayFast, SnapScan, debit/credit card, EFT).
              </p>
              <p>
                <strong>4.3.</strong> We reserve the right to correct any errors in pricing or product information at any time, even after an order has been placed.
              </p>
              <p>
                <strong>4.4.</strong> Orders will only be processed once full payment has been received.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              5. Shipping and Delivery
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>5.1.</strong> We deliver nationwide using trusted courier partners.
              </p>
              <p>
                <strong>5.2.</strong> Estimated delivery times are 2–5 working days for major cities and 5–7 days for outlying areas.
              </p>
              <p>
                <strong>5.3.</strong> Once your order is shipped, you'll receive a tracking number via email or SMS.
              </p>
              <p>
                <strong>5.4.</strong> Delivery delays caused by external courier services, strikes, or natural causes are beyond our control.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              6. Returns and Exchanges
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>6.1.</strong> We accept returns for unworn, unused items within 7-14 days of delivery for an exchange or refund.
              </p>
              <p>
                <strong>6.2.</strong> Exchanges are accepted if you receive a damaged, incorrect, or defective item.
              </p>
              <p>
                <strong>6.3.</strong> You must notify us within 48 hours of receiving your order to qualify for an exchange, providing proof (e.g., photos).
              </p>
              <p>
                <strong>6.4.</strong> The product must be unworn, unused, and in its original packaging.
              </p>
              <p>
                <strong>6.5.</strong> BabyFictions reserves the right to inspect and approve all exchange requests before replacement or refund.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              7. Intellectual Property
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>7.1.</strong> All content on this website — including logos, images, text, and graphics — is the property of BabyFictions.
              </p>
              <p>
                <strong>7.2.</strong> You may not copy, reproduce, or use any content without our prior written permission.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              8. Limitation of Liability
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                <strong>8.1.</strong> BabyFictions shall not be held liable for any indirect, incidental, or consequential damages arising from your use of this website or products.
              </p>
              <p>
                <strong>8.2.</strong> We make no warranties that our site will be uninterrupted, error-free, or secure at all times.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              9. Governing Law
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>
                These Terms are governed by and construed in accordance with the laws of the Republic of South Africa.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-[family-name:var(--font-nav)] text-xl sm:text-2xl font-semibold mb-4">
              10. Contact Information
            </h2>
            <div className="space-y-3 font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed text-[#333]">
              <p>For any questions regarding these Terms, please contact us at:</p>
              <ul className="space-y-2 pl-6">
                <li>
                  <strong>📧 Email:</strong>{' '}
                  <a href="mailto:support@babyfictions.co.za" className="underline hover:opacity-70">
                    support@babyfictions.co.za
                  </a>
                </li>
                <li>
                  <strong>📞 Phone:</strong> 705-742-3221
                </li>
                <li>
                  <strong>📍 Address:</strong> 152A Charlotte Street, Peterborough ON, South Africa
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-[#e0e0e0]">
          <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm text-center text-[#999] italic">
            By using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </main>
  );
}
