"use client";
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Star } from 'lucide-react';
import { track } from '@/lib/analytics';
import RequireAuth from '@/components/RequireAuth';
import { fetchJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

function CheckoutInner() {
  const params = useSearchParams();
  const name = params.get('name') || params.get('product') || 'Selected Product';
  const price = params.get('price') || '—';
  const id = params.get('id') || 'unknown';
  const initialImage = params.get('image') || '';
  const { user, loading } = useCurrentUser();
  const { toast } = useToast();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resolvedImage, setResolvedImage] = useState<string>(initialImage);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Array<{ rating: number; comment: string; user?: string }>>([]);

  // Cart data
  const [cartItems, setCartItems] = useState<Array<{ _id?: string; quantity: number; product: any }>>([]);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(`bf_reviews_${id}`) : null;
      const list = raw ? JSON.parse(raw) : [];
      setReviews(Array.isArray(list) ? list : []);
    } catch {
      setReviews([]);
    }
  }, [id]);

  // Resolve image from product if not provided
  useEffect(() => {
    (async () => {
      if (resolvedImage || !id || id === 'unknown') return;
      try {
        const res: any = await fetchJson(`/api/products/${id}`);
        const p = res?.product || res?.data || res;
        const thumb = p?.thumbnail || (Array.isArray(p?.images) ? p.images[0] : '');
        if (thumb) setResolvedImage(thumb);
      } catch {
        // ignore
      }
    })();
  }, [id, resolvedImage]);

  // Track checkout start when landing on this page
  useEffect(() => {
    // parse price string like "$19.99" to number
    const num = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : NaN;
    const amount = isNaN(num) ? undefined : num;
    track({ type: 'checkout_start', amount });
  }, [id]);

  // Load authenticated user's cart (server cart)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res: any = await fetchJson('/api/cart');
        const cart = res?.cart || res?.data || res;
        const items = Array.isArray(cart?.items) ? cart.items : [];
        if (active) setCartItems(items);
      } catch {
        // ignore for now
      } finally {
        if (active) setCartLoading(false);
      }
    })();
    return () => { active = false };
  }, []);

  // Totals: prefer cart, fallback to single item from URL params
  const { subtotal, shipping, tax, total } = useMemo(() => {
    const TAX_RATE = 0.07; // 7%
    let sub = 0;
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      for (const it of cartItems) {
        const p = it?.product || {};
        const priceNum = typeof p.price === 'number' ? p.price : 0;
        sub += priceNum * (it?.quantity || 0);
      }
    } else {
      // fallback from URL param price (may include symbols)
      const num = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : 0;
      sub = isNaN(num) ? 0 : num;
    }
    const ship = sub >= 3000 ? 0 : (sub > 0 ? 130 : 0);
    const t = sub * TAX_RATE;
    const tot = sub + ship + t;
    return { subtotal: sub, shipping: ship, tax: t, total: tot };
  }, [cartItems, price]);

  const handlePay = async () => {
    setProcessing(true);
    try {
      // Demo payment flow
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: 'Payment successful (demo)', description: `Thanks, ${user?.name || 'shopper'}!` });
      // Clear cart for demo
      try {
        localStorage.setItem('bf_cart', JSON.stringify([]));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('bf_cart_updated'));
        }
      } catch {}
    } catch {
      toast({ title: 'Payment failed', description: 'Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const submitReview = () => {
    if (!rating || !comment.trim()) return;
    const next = [...reviews, { rating, comment, user: user?.name || user?.email || 'Anonymous' }];
    setReviews(next);
    try {
      localStorage.setItem(`bf_reviews_${id}`, JSON.stringify(next));
    } catch {}
    setRating(0);
    setComment('');
    toast({ title: 'Review added', description: 'Thanks for your feedback!' });
    try {
      track({ type: 'review_submitted', productId: id, rating });
    } catch {}
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review your item and proceed to payment.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-4">
            {cartLoading ? (
              <div className="text-sm text-muted-foreground">Loading cart…</div>
            ) : (Array.isArray(cartItems) && cartItems.length > 0) ? (
              cartItems.map((it) => {
                const p = it?.product || {};
                const img = p?.thumbnail || (Array.isArray(p?.images) ? p.images[0] : '');
                return (
                  <div key={it?._id || p?._id} className="flex items-start gap-4">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p?.name || 'Product'} className="h-20 w-20 rounded object-cover" />
                    ) : (
                      <div className="h-20 w-20 rounded bg-gray-100" />
                    )}
                    <div className="flex-1">
                      <div className="text-base font-medium">{p?.name || 'Product'}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Qty: {it?.quantity || 1}</div>
                    </div>
                    <div className="text-sm font-medium">
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format((p?.price || 0) * (it?.quantity || 1))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-start gap-4">
                {resolvedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolvedImage} alt={name} className="h-20 w-20 rounded object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded bg-gray-100" />
                )}
                <div className="flex-1">
                  <div className="text-base font-medium">{name}</div>
                </div>
                <div className="text-sm font-medium">{price}</div>
              </div>
            )}

            <div className="pt-4 mt-2 border-t space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (7%)</span><span>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(tax)}</span></div>
              <div className="flex justify-between font-semibold pt-2"><span>Total</span><span>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(total)}</span></div>
              <div className="text-xs text-muted-foreground">Free shipping on orders over R3000. Standard shipping R130.</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 space-y-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Checking your account…</div>
          ) : user ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">Signed in as {user.name || user.email}</p>

              {/* Payment Form (Demo) */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 gap-3">
                  <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" className="rounded border px-3 py-2" />
                  <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Card number" className="rounded border px-3 py-2" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="rounded border px-3 py-2" />
                    <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="CVV" className="rounded border px-3 py-2" />
                  </div>
                </div>
                <button disabled={processing} onClick={handlePay} className="mt-4 w-full rounded bg-black px-4 py-2 text-white flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {processing ? 'Processing…' : 'Pay Now'}
                </button>
              </div>

              {/* Reviews / Comments */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Reviews</h3>
                <div className="flex items-center gap-2 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} title={`${n} star${n>1?'s':''}`}
                      className={`rounded p-1 ${rating >= n ? 'text-yellow-500' : 'text-zinc-400'}`}
                    >
                      <Star className="h-5 w-5" />
                    </button>
                  ))}
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment…" className="w-full rounded border px-3 py-2" rows={3} />
                <div className="mt-2 flex justify-end">
                  <button onClick={submitReview} className="rounded bg-black px-4 py-2 text-white">Submit Review</button>
                </div>
                <div className="mt-4 space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  ) : (
                    reviews.map((r, idx) => (
                      <div key={idx} className="rounded border p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{r.user || 'Anonymous'}</div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4" />)}
                          </div>
                        </div>
                        <p className="mt-1 text-sm">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-lg font-semibold">Create an account to complete checkout</h2>
              <p className="mt-2 text-sm text-muted-foreground">You need to be signed in to finish your purchase.</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Link className="rounded bg-black px-4 py-2 text-white" href="/auth/login">Login</Link>
                <Link className="rounded border px-4 py-2" href="/auth/signup">Sign up</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <Suspense fallback={<main className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">Loading…</main>}>
        <CheckoutInner />
      </Suspense>
    </RequireAuth>
  );
}
