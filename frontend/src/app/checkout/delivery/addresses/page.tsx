"use client";
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';

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

function AddressesInner() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load addresses
  useEffect(() => {
    (async () => {
      try {
        // This would be an API call to get user's addresses
        // For now, we'll use localStorage
        const saved = localStorage.getItem('bf_addresses');
        if (saved) {
          const parsed = JSON.parse(saved);
          setAddresses(parsed);
          const defaultAddr = parsed.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          }
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = addresses.find(a => a._id === addressId);
    if (address) {
      // Save as default
      const updated = addresses.map(a => ({
        ...a,
        isDefault: a._id === addressId
      }));
      setAddresses(updated);
      localStorage.setItem('bf_addresses', JSON.stringify(updated));
      localStorage.setItem('bf_default_address', JSON.stringify(address));
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const updated = addresses.filter(a => a._id !== addressId);
      setAddresses(updated);
      localStorage.setItem('bf_addresses', JSON.stringify(updated));
      
      if (selectedAddressId === addressId) {
        setSelectedAddressId('');
        localStorage.removeItem('bf_default_address');
      }
      
      toast({ title: 'Address Deleted', description: 'The address has been removed' });
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast({ title: 'Select Address', description: 'Please select a delivery address', variant: 'destructive' });
      return;
    }
    router.push('/checkout/review');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center font-[family-name:var(--font-body)] text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/checkout/review" className="inline-flex items-center gap-2 font-[family-name:var(--font-nav)] text-sm text-blue-600 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Order review
          </Link>
          <h1 className="font-[family-name:var(--font-headers)] text-2xl sm:text-3xl uppercase tracking-[2px]">Delivery</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header with Add Button */}
              <div className="flex items-center justify-between p-6 border-b border-black/10">
                <h2 className="font-[family-name:var(--font-headers)] text-lg uppercase tracking-[2px]">Delivery Addresses</h2>
                <Link 
                  href="/checkout/delivery/addresses/add"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors"
                >
                  Add Address
                </Link>
              </div>

              {/* Addresses List */}
              <div className="p-6 space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="font-[family-name:var(--font-body)] text-black/60 mb-4">No delivery addresses saved</p>
                    <Link 
                      href="/checkout/delivery/addresses/add"
                      className="inline-block bg-black text-white px-6 py-3 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-black/80 transition-colors"
                    >
                      Add Your First Address
                    </Link>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`relative border-2 rounded-lg p-6 transition-all cursor-pointer ${
                        selectedAddressId === address._id
                          ? 'border-[#4CAF50] bg-green-50/50'
                          : 'border-black/10 hover:border-black/30'
                      }`}
                      onClick={() => handleSelectAddress(address._id)}
                    >
                      {/* Radio Button */}
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === address._id
                              ? 'border-[#4CAF50] bg-[#4CAF50]'
                              : 'border-black/30'
                          }`}>
                            {selectedAddressId === address._id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="flex-1">
                          <p className="font-[family-name:var(--font-body)] font-medium text-base mb-1">{address.recipientName}</p>
                          <p className="font-[family-name:var(--font-body)] text-sm text-black/80">
                            {address.streetAddress}
                            {address.complex && `, ${address.complex}`}
                          </p>
                          <p className="font-[family-name:var(--font-body)] text-sm text-black/80">
                            {address.suburb && `${address.suburb}, `}
                            {address.city}, {address.province}, {address.postalCode}
                          </p>
                          <p className="font-[family-name:var(--font-body)] text-sm text-black/60 mt-1">{address.recipientMobile}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link
                            href={`/checkout/delivery/addresses/update/${address._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-black/60 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id);
                            }}
                            className="p-2 text-black/60 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Confirm Button */}
              {addresses.length > 0 && (
                <div className="p-6 border-t border-black/10">
                  <button
                    onClick={handleContinue}
                    disabled={!selectedAddressId}
                    className="w-full bg-[#4CAF50] text-white py-4 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-[#45a049] transition-colors disabled:bg-black/20 disabled:cursor-not-allowed"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DeliveryAddressesPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <Suspense fallback={
        <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-center font-[family-name:var(--font-body)] text-sm">Loading...</p>
          </div>
        </main>
      }>
        <AddressesInner />
      </Suspense>
    </RequireAuth>
  );
}
