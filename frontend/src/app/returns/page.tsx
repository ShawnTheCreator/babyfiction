export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-white pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px]">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <h1 className="font-[family-name:var(--font-headers)] text-[48px] font-normal text-black mb-8 leading-[1.2] uppercase tracking-wide md:text-4xl sm:text-[32px]">
          Return Policy
        </h1>

        {/* Content */}
        <div className="space-y-6">
          <p className="font-[family-name:var(--font-body)] text-base text-gray-700 leading-relaxed">
            At this moment, we do not offer any returns, exchanges, or refunds on any products purchased through our store.
          </p>

          <p className="font-[family-name:var(--font-body)] text-base text-gray-700 leading-relaxed">
            We encourage customers to carefully review product descriptions, sizing information, and images before completing their purchase. If you have any questions about a product prior to ordering, please contact us at our support email and we will gladly assist.
          </p>

          <p className="font-[family-name:var(--font-body)] text-base text-gray-700 leading-relaxed">
            This policy may be updated in the future as our operations grow.
          </p>

          {/* Contact Information */}
          <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded">
            <h2 className="font-[family-name:var(--font-nav)] text-lg font-semibold uppercase tracking-wide mb-4">
              Need Help?
            </h2>
            <p className="font-[family-name:var(--font-body)] text-sm text-gray-700 mb-3">
              If you have any questions about our return policy or need assistance with a product, please contact us:
            </p>
            <div className="space-y-2">
              <p className="font-[family-name:var(--font-body)] text-sm text-black">
                <strong className="font-semibold">Email:</strong>{' '}
                <a href="mailto:babyfictions2021@gmail.com" className="text-black underline hover:text-gray-600 transition-colors">
                  babyfictions2021@gmail.com
                </a>
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm text-black">
                <strong className="font-semibold">Enquiries:</strong>{' '}
                <a href="tel:+27720963819" className="text-black underline hover:text-gray-600 transition-colors">
                  +27 72 096 3819
                </a>
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm text-black">
                <strong className="font-semibold">WhatsApp:</strong>{' '}
                <a href="https://wa.me/27848488516" className="text-black underline hover:text-gray-600 transition-colors" target="_blank" rel="noopener noreferrer">
                  +27 84 848 8516
                </a>
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <p className="font-[family-name:var(--font-body)] text-xs text-gray-500 mt-8 pt-8 border-t border-gray-200">
            Last updated: November 14, 2025
          </p>
        </div>
      </div>
    </main>
  );
}
