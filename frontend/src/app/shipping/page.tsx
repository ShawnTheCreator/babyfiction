"use client";
import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, Clock, Package, Shield, PhoneCall } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px]">
      <div className="max-w-[1200px] mx-auto">
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 font-[family-name:var(--font-nav)] text-sm text-black/60 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-[family-name:var(--font-headers)] text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 uppercase tracking-[2px]">
            Shipping Policy
          </h1>
          <div className="h-[2px] bg-black w-24 mb-6"></div>
          <p className="font-[family-name:var(--font-body)] text-base text-gray-600 max-w-3xl">
            At Baby Fiction, we're committed to delivering your streetwear essentials with speed and care. 
            Review our shipping information below to know what to expect with your order.
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-black" />
              <h3 className="font-[family-name:var(--font-nav)] text-base font-semibold uppercase tracking-wider">
                Processing Time
              </h3>
            </div>
            <p className="font-[family-name:var(--font-body)] text-sm text-gray-600">
              Orders processed within 1-2 business days
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-6 h-6 text-black" />
              <h3 className="font-[family-name:var(--font-nav)] text-base font-semibold uppercase tracking-wider">
                Delivery Time:
              </h3>
            </div>
            <p className="font-[family-name:var(--font-body)] text-sm text-gray-600">
              2-5 business days within South Africa
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-6 h-6 text-black" />
              <h3 className="font-[family-name:var(--font-nav)] text-base font-semibold uppercase tracking-wider">
                Free Shipping
              </h3>
            </div>
            <p className="font-[family-name:var(--font-body)] text-sm text-gray-600">
              On all orders over R1,300
            </p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-12">
          {/* Shipping Rates & Delivery Times */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-7 h-7" />
              <h2 className="font-[family-name:var(--font-headers)] text-2xl font-bold uppercase tracking-[2px]">
                Shipping Rates & Delivery Times
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-[family-name:var(--font-nav)] text-lg font-semibold mb-3 uppercase tracking-wider">
                    Standard Delivery (South Africa)
                  </h3>
                  <div className="font-[family-name:var(--font-body)] text-sm text-gray-700 space-y-2">
                    <p>• <strong>Cost:</strong> R130.00 (Free for orders over R1,300)</p>
                    <p>• <strong>Delivery Time:</strong> 2-5 business days</p>
                    <p>• <strong>Coverage:</strong> All major cities and metro areas</p>
                    <p className="text-xs text-gray-500 italic mt-3">
                      * Delivery times may vary depending on your location and courier availability
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-300">
                  <h3 className="font-[family-name:var(--font-nav)] text-lg font-semibold mb-3 uppercase tracking-wider">
                    Remote Areas
                  </h3>
                  <p className="font-[family-name:var(--font-body)] text-sm text-gray-700">
                    Orders to remote or rural areas may require additional 2-3 business days for delivery. 
                    Additional courier fees may apply and will be communicated before dispatch.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Order Processing */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-7 h-7" />
              <h2 className="font-[family-name:var(--font-headers)] text-2xl font-bold uppercase tracking-[2px]">
                Order Processing
              </h2>
            </div>
            <div className="font-[family-name:var(--font-body)] text-sm text-gray-700 space-y-4">
              <p>
                All orders are processed within <strong>1-2 business days</strong> (Monday to Friday, excluding public holidays). 
                Orders placed after 2:00 PM on Friday will be processed on the following Monday.
              </p>
              <p>
                Once your order has been dispatched, you will receive a confirmation email with tracking information 
                so you can monitor your delivery in real-time.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
                <p className="font-semibold text-amber-900 mb-2">⚠️ Important Note:</p>
                <p className="text-amber-800 text-sm">
                  During peak seasons (Black Friday, December holidays, Back to School), processing and delivery times 
                  may be extended by 3-5 additional business days.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping Destinations */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-7 h-7" />
              <h2 className="font-[family-name:var(--font-headers)] text-2xl font-bold uppercase tracking-[2px]">
                Shipping Destinations
              </h2>
            </div>
            <div className="font-[family-name:var(--font-body)] text-sm text-gray-700 space-y-4">
              <p>
                Currently, we ship to <strong>addresses within South Africa only</strong>. We deliver to both residential 
                and business addresses nationwide.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                <p className="font-semibold text-blue-900 mb-2">📦 PO Boxes & Postnet:</p>
                <p className="text-blue-800 text-sm">
                  Unfortunately, we cannot deliver to PO Boxes or Postnet addresses. Please provide a physical street address.
                </p>
              </div>
              <p className="text-gray-600 italic">
                International shipping is coming soon! Follow us on social media for updates.
              </p>
            </div>
          </section>

          {/* Order Tracking */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-7 h-7" />
              <h2 className="font-[family-name:var(--font-headers)] text-2xl font-bold uppercase tracking-[2px]">
                Order Tracking
              </h2>
            </div>
            <div className="font-[family-name:var(--font-body)] text-sm text-gray-700 space-y-4">
              <p>
                Once your order has been dispatched, you'll receive an email with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order confirmation and tracking number</li>
                <li>Estimated delivery date</li>
                <li>Link to track your parcel in real-time</li>
                <li>Courier contact information</li>
              </ul>
              <p className="mt-4">
                You can also track your order by visiting your <Link href="/orders" className="text-blue-600 hover:underline font-semibold">Order History</Link> page 
                and clicking on the tracking link.
              </p>
            </div>
          </section>

          {/* Delivery Issues */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-7 h-7" />
              <h2 className="font-[family-name:var(--font-headers)] text-2xl font-bold uppercase tracking-[2px]">
                Delivery Issues
              </h2>
            </div>
            <div className="font-[family-name:var(--font-body)] text-sm text-gray-700 space-y-4">
              <div>
                <h3 className="font-[family-name:var(--font-nav)] text-base font-semibold mb-2 uppercase tracking-wider">
                  Lost or Damaged Parcels
                </h3>
                <p>
                  While rare, if your parcel is lost or damaged in transit, please contact us within 
                  <strong> 48 hours of the expected delivery date</strong>. We'll work with the courier to investigate 
                  and resolve the issue immediately.
                </p>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-nav)] text-base font-semibold mb-2 uppercase tracking-wider">
                  Incorrect Address
                </h3>
                <p>
                  Please ensure your delivery address is accurate and complete. We are not responsible for orders 
                  delivered to incorrect addresses provided by the customer. Address changes after dispatch may 
                  incur additional courier fees.
                </p>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-nav)] text-base font-semibold mb-2 uppercase tracking-wider">
                  Failed Delivery Attempts
                </h3>
                <p>
                  If the courier is unable to deliver your parcel after 2 attempts, the package will be returned 
                  to our warehouse. You may need to arrange re-delivery (additional fees may apply) or collect 
                  from a designated pickup point.
                </p>
              </div>
            </div>
          </section>

          {/* Customs & Duties */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-7 h-7" />
              <h2 className="font-[family-name:var(--font-headers)] text-2xl font-bold uppercase tracking-[2px]">
                Customs & Import Duties
              </h2>
            </div>
            <div className="font-[family-name:var(--font-body)] text-sm text-gray-700 space-y-4">
              <p>
                As we currently only ship within South Africa, customs and import duties do not apply to your orders.
              </p>
              <p className="text-gray-600 italic">
                When international shipping becomes available, customers will be responsible for any applicable 
                customs duties, taxes, and fees imposed by their destination country.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-black text-white rounded-lg p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <PhoneCall className="w-7 h-7" />
              <h2 className="font-[family-name:var(--font-headers)] text-2xl font-bold uppercase tracking-[2px]">
                Need Help?
              </h2>
            </div>
            <p className="font-[family-name:var(--font-body)] text-sm mb-6">
              Have questions about your shipment or need assistance? Our customer service team is here to help.
            </p>
            <div className="space-y-3">
              <p className="font-[family-name:var(--font-body)] text-sm">
                <strong>Email:</strong> <a href="mailto:info@babyfiction.co.za" className="underline hover:text-gray-300">info@babyfiction.co.za</a>
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm">
                <strong>Phone:</strong> <a href="tel:+27123456789" className="underline hover:text-gray-300">+27 (0) 12 345 6789</a>
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm">
                <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM (SAST)
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <Link 
                href="/contact"
                className="inline-block bg-white text-black px-8 py-3 rounded font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="font-[family-name:var(--font-body)] text-xs text-gray-500">
              Last updated: November 15, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
