"use client";
import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchJson } from '@/lib/api';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await fetchJson('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, source: 'footer' })
      });
      
      setSuccess(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm">Thanks for subscribing! Check your email.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Get exclusive offers, style tips, and early access to new products.
      </p>
    </form>
  );
}
