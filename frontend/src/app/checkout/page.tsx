"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Star } from 'lucide-react';

export default function CheckoutPage() {
  const params = useSearchParams();
  const name = params.get('name') || params.get('product') || 'Selected Product';
  const price = params.get('price') || '—';
  const image = params.get('image') || '';
  const id = params.get('id') || 'unknown';
  const { user, loading } = useCurrentUser();
  const { toast } = useToast();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Array<{ rating: number; comment: string; user?: string }>>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(`bf_reviews_${id}`) : null;
      const list = raw ? JSON.parse(raw) : [];
      setReviews(Array.isArray(list) ? list : []);
    } catch {
      setReviews([]);
    }
  }, [id]);

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
          <div className="mt-4 flex items-start gap-4">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className="h-24 w-24 rounded object-cover" />
            ) : (
              <div className="h-24 w-24 rounded bg-gray-100" />
            )}
            <div>
              <div className="text-base font-medium">{name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{price}</div>
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


