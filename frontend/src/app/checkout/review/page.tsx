"use client";
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { fetchJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Address {
  _id: string;
  type: 'RESIDENTIAL' | 'BUSINESS';
  recipientName: string;
  recipientMobile: string;
  streetAddress: string;
  complex?: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}

function ReviewInner() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<Array<{ _id?: string; quantity: number; product: any }>>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  // Load cart items
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res: any = await fetchJson('/api/cart');
        const cart = res?.cart || res?.data || res;
        const items = Array.isArray(cart?.items) ? cart.items : [];
        if (active) setCartItems(items);
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        if (active) setCartLoading(false);
      }
    })();
    return () => { active = false };
  }, []);

  // Load default address
  useEffect(() => {
    (async () => {
      try {
        // This would be an API call to get user's addresses
        // For now, we'll check localStorage
        const saved = localStorage.getItem('bf_default_address');
        if (saved) {
          setSelectedAddress(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load address:', err);
      }
    })();
  }, []);

  // Calculate totals
  const { subtotal, shipping, vat, discount, total, itemCount } = useMemo(() => {
    const TAX_RATE = 0.15; // 15% VAT
    let sub = 0;
    let count = 0;

    if (Array.isArray(cartItems) && cartItems.length > 0) {
      for (const it of cartItems) {
        const p = it?.product || {};
        const priceNum = typeof p.price === 'number' ? p.price : 0;
        const qty = it?.quantity || 0;
        sub += priceNum * qty;
        count += qty;
      }
    }

    // Shipping logic: R1300+ free, else R130 metro
    const ship = sub >= 1300 ? 0 : (sub > 0 ? 130 : 0);
    const disc = discountApplied;
    
    // VAT is inclusive in the price: selling price = base price * (1 + 15/100)
    // So VAT = selling price - (selling price / 1.15)
    const subtotalAfterDiscount = sub - disc;
    const vatAmount = subtotalAfterDiscount - (subtotalAfterDiscount / 1.15);
    const tot = subtotalAfterDiscount + ship;

    return { 
      subtotal: sub, 
      shipping: ship, 
      vat: vatAmount, 
      discount: disc,
      total: tot,
      itemCount: count
    };
  }, [cartItems, discountApplied]);

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;
    
    // Demo discount logic
    const code = discountCode.toUpperCase();
    let discountAmount = 0;
    
    if (code === 'SAVE10') {
      discountAmount = subtotal * 0.1;
      toast({ title: 'Discount Applied!', description: '10% off your order' });
    } else if (code === 'WELCOME15') {
      discountAmount = subtotal * 0.15;
      toast({ title: 'Discount Applied!', description: '15% welcome discount' });
    } else {
      toast({ title: 'Invalid Code', description: 'Please check your discount code', variant: 'destructive' });
      return;
    }
    
    setDiscountApplied(discountAmount);
    setShowDiscountInput(false);
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      toast({ title: 'Address Required', description: 'Please select a delivery address', variant: 'destructive' });
      return;
    }
    
    if (!paymentMethod) {
      toast({ title: 'Payment Method Required', description: 'Please select a payment method', variant: 'destructive' });
      return;
    }

    // Proceed to payment processing
    toast({ title: 'Processing...', description: 'Redirecting to payment gateway' });
    // Here you would redirect to payment gateway or process order
  };

  if (cartLoading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-center font-[family-name:var(--font-body)] text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-headers)] text-2xl sm:text-3xl uppercase tracking-[2px] mb-4">Your cart is empty</h1>
            <Link href="/catalog" className="inline-block bg-black text-white px-6 py-3 font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-black/80 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-headers)] text-2xl sm:text-3xl uppercase tracking-[2px]">
            Review your order
          </h1>
          <Link
            href="/cart"
            className="flex items-center gap-2 font-[family-name:var(--font-nav)] text-sm text-black/60 hover:text-black transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-headers)] text-lg uppercase tracking-[2px]">
                  Delivery Address
                </h2>
                <Link
                  href="/checkout/delivery/addresses"
                  className="font-[family-name:var(--font-nav)] text-sm text-blue-600 hover:underline"
                >
                  Change
                </Link>
              </div>

              {selectedAddress ? (
                <div className="space-y-2">
                  <div className="inline-block bg-[#4CAF50] text-white px-3 py-1 rounded text-xs font-[family-name:var(--font-nav)] uppercase mb-2">
                    {selectedAddress.type}
                  </div>
                  <p className="font-[family-name:var(--font-body)] font-medium">
                    {selectedAddress.recipientName}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-sm text-black/60">
                    {selectedAddress.streetAddress}
                    {selectedAddress.complex && `, ${selectedAddress.complex}`}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-sm text-black/60">
                    {selectedAddress.suburb && `${selectedAddress.suburb}, `}
                    {selectedAddress.city}, {selectedAddress.province},{" "}
                    {selectedAddress.postalCode}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-sm text-black/60">
                    {selectedAddress.recipientMobile}
                  </p>
                </div>
              ) : (
                <Link
                  href="/checkout/delivery/addresses/add"
                  className="block w-full border-2 border-dashed border-black/20 rounded-lg p-6 text-center hover:border-black/40 transition-colors"
                >
                  <p className="font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider">
                    + Add Delivery Address
                  </p>
                </Link>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-headers)] text-lg uppercase tracking-[2px]">
                  Payment Method
                </h2>
                {paymentMethod && (
                  <button
                    onClick={() => setPaymentMethod("")}
                    className="font-[family-name:var(--font-nav)] text-sm text-blue-600 hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>

              {!paymentMethod ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("payfast")}
                    className="w-full flex items-center justify-between border-2 border-black/10 rounded-lg p-4 hover:border-black/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <img
                          src="/assets/images/icons/payfast.svg"
                          alt="PayFast"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-[family-name:var(--font-nav)] font-medium">
                          PayFast
                        </p>
                        <p className="font-[family-name:var(--font-body)] text-xs text-black/60">
                          Instant EFT, Cards
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-black/40" />
                  </button>

                  <button
                    onClick={() => setPaymentMethod("capitec-pay")}
                    className="w-full flex items-center justify-between border-2 border-black/10 rounded-lg p-4 hover:border-black/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <img
                          src="/assets/images/icons/capitec-pay.svg"
                          alt="Capitec Pay"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-[family-name:var(--font-nav)] font-medium">
                          Capitec Pay
                        </p>
                        <p className="font-[family-name:var(--font-body)] text-xs text-black/60">
                          Pay with Capitec
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-black/40" />
                  </button>

                  <button
                    onClick={() => setPaymentMethod("google-pay")}
                    className="w-full flex items-center justify-between border-2 border-black/10 rounded-lg p-4 hover:border-black/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <img
                          src="/assets/images/icons/google-pay.svg"
                          alt="Google Pay"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-[family-name:var(--font-nav)] font-medium">
                          Google Pay
                        </p>
                        <p className="font-[family-name:var(--font-body)] text-xs text-black/60">
                          Pay with Google
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-black/40" />
                  </button>

                  <button
                    onClick={() => setPaymentMethod("apple-pay")}
                    className="w-full flex items-center justify-between border-2 border-black/10 rounded-lg p-4 hover:border-black/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <img
                          src="/assets/images/icons/apple-pay.svg"
                          alt="Apple Pay"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-[family-name:var(--font-nav)] font-medium">
                          Apple Pay
                        </p>
                        <p className="font-[family-name:var(--font-body)] text-xs text-black/60">
                          Pay with Apple
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-black/40" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-[#f5f5f5] rounded-lg">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img
                      src={
                        paymentMethod === "payfast"
                          ? "/assets/images/icons/payfast.svg"
                          : paymentMethod === "capitec-pay"
                          ? "/assets/images/icons/capitec-pay.svg"
                          : paymentMethod === "google-pay"
                          ? "/assets/images/icons/google-pay.svg"
                          : "/assets/images/icons/apple-pay.svg"
                      }
                      alt={
                        paymentMethod === "payfast"
                          ? "PayFast"
                          : paymentMethod === "capitec-pay"
                          ? "Capitec Pay"
                          : paymentMethod === "google-pay"
                          ? "Google Pay"
                          : "Apple Pay"
                      }
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-nav)] font-medium capitalize">
                      {paymentMethod === "payfast"
                        ? "PayFast"
                        : paymentMethod === "capitec-pay"
                        ? "Capitec Pay"
                        : paymentMethod === "google-pay"
                        ? "Google Pay"
                        : "Apple Pay"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Discount Code */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {!showDiscountInput && discountApplied === 0 ? (
                <button
                  onClick={() => setShowDiscountInput(true)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <p className="font-[family-name:var(--font-nav)] font-medium">
                      Add Gift Voucher or Coupon Code
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black/40" />
                </button>
              ) : discountApplied > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-[family-name:var(--font-nav)] font-medium">
                        Discount Applied
                      </p>
                      <p className="font-[family-name:var(--font-body)] text-xs text-black/60">
                        Code: {discountCode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDiscountApplied(0);
                      setDiscountCode("");
                    }}
                    className="font-[family-name:var(--font-nav)] text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter discount code"
                    className="w-full border-2 border-black/10 rounded-lg px-4 py-3 font-[family-name:var(--font-body)] text-sm focus:border-black/30 focus:outline-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleApplyDiscount}
                      className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-black/80 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setShowDiscountInput(false);
                        setDiscountCode("");
                      }}
                      className="px-4 py-3 border-2 border-black/10 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:border-black/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            `
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
              <h2 className="font-[family-name:var(--font-headers)] text-lg uppercase tracking-[2px] mb-4">
                Order Summary
              </h2>

              {/* Items Count */}
              <div className="mb-4 pb-4 border-b border-black/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-[family-name:var(--font-body)] text-sm font-medium">
                    Items for delivery
                  </span>
                  <button
                    onClick={() => setShowOrderDetails(!showOrderDetails)}
                    className="font-[family-name:var(--font-nav)] text-xs text-blue-600 hover:underline"
                  >
                    {showOrderDetails ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {!showOrderDetails ? (
                  <div className="flex gap-2">
                    {cartItems.slice(0, 3).map((item) => {
                      const img =
                        item?.product?.thumbnail ||
                        (Array.isArray(item?.product?.images)
                          ? item.product.images[0]
                          : "");
                      return (
                        <div
                          key={item._id}
                          className="relative w-16 h-16 rounded overflow-hidden bg-gray-100"
                        >
                          {img && (
                            <img
                              src={img}
                              alt={item?.product?.name || "Product"}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      );
                    })}
                    {cartItems.length > 3 && (
                      <div className="w-16 h-16 rounded bg-black/5 flex items-center justify-center">
                        <span className="font-[family-name:var(--font-nav)] text-sm text-black/60">
                          +{cartItems.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    {cartItems.map((item) => {
                      const img =
                        item?.product?.thumbnail ||
                        (Array.isArray(item?.product?.images)
                          ? item.product.images[0]
                          : "");
                      const productPrice =
                        typeof item?.product?.price === "number"
                          ? item.product.price
                          : 0;
                      const itemTotal = productPrice * (item?.quantity || 0);

                      return (
                        <div
                          key={item._id}
                          className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            {img && (
                              <img
                                src={img}
                                alt={item?.product?.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-[family-name:var(--font-body)] text-sm font-medium truncate">
                              {item?.product?.name || "Product"}
                            </h4>
                            <p className="font-[family-name:var(--font-body)] text-xs text-black/60 mt-1">
                              R {productPrice.toFixed(2)} Qty:{" "}
                              {item?.quantity || 0}
                            </p>
                            <p className="font-[family-name:var(--font-body)] text-sm font-medium mt-1">
                              R {itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-body)] text-sm text-black/60">
                    {itemCount} Items
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-sm">
                    R {subtotal.toFixed(2)}
                  </span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="font-[family-name:var(--font-body)] text-sm">
                      Discount
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-sm">
                      -R {discountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-body)] text-sm text-black/60">
                    VAT (15% inclusive)
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-sm">
                    R {vat.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-body)] text-sm text-black/60">
                    Delivery
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-sm">
                    {shipping === 0 ? "Free" : `R ${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-black/10 mb-6">
                <span className="font-[family-name:var(--font-headers)] text-lg uppercase tracking-[2px]">
                  TO PAY:
                </span>
                <span className="font-[family-name:var(--font-headers)] text-xl text-[#4CAF50]">
                  R {total.toFixed(2)}
                </span>
              </div>

              {/* Secure Checkout Badge */}
              <div className="flex items-center justify-center gap-2 mb-6 text-black/60">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="font-[family-name:var(--font-body)] text-xs">
                  Secure Checkout
                </span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={processing || !selectedAddress || !paymentMethod}
                className="w-full bg-[#4CAF50] text-white py-4 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-[#45a049] transition-colors disabled:bg-black/20 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing…' : 'PAY'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <Suspense fallback={
        <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-center font-[family-name:var(--font-body)] text-sm">Loading...</p>
          </div>
        </main>
      }>
        <ReviewInner />
      </Suspense>
    </RequireAuth>
  );
}
