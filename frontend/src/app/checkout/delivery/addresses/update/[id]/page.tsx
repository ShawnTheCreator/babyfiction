"use client";
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';

export const dynamic = 'force-dynamic';

interface AddressFormData {
  type: 'RESIDENTIAL' | 'BUSINESS';
  recipientName: string;
  recipientMobile: string;
  streetAddress: string;
  complex: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
];

function UpdateAddressInner() {
  const router = useRouter();
  const params = useParams();
  const addressId = params.id as string;
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const [formData, setFormData] = useState<AddressFormData>({
    type: 'RESIDENTIAL',
    recipientName: user?.name || '',
    recipientMobile: '',
    streetAddress: '',
    complex: '',
    suburb: '',
    city: '',
    province: 'Gauteng',
    postalCode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Load existing address
  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem('bf_addresses');
        if (saved) {
          const addresses = JSON.parse(saved);
          const address = addresses.find((a: any) => a._id === addressId);
          
          if (address) {
            setFormData({
              type: address.type,
              recipientName: address.recipientName,
              recipientMobile: address.recipientMobile,
              streetAddress: address.streetAddress,
              complex: address.complex || '',
              suburb: address.suburb || '',
              city: address.city,
              province: address.province,
              postalCode: address.postalCode
            });
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load address:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [addressId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof AddressFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.recipientMobile.trim()) {
      newErrors.recipientMobile = 'Mobile number is required';
    } else if (!/^[0-9+\s()-]{10,}$/.test(formData.recipientMobile)) {
      newErrors.recipientMobile = 'Please enter a valid mobile number';
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City/Town is required';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^[0-9]{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateAddress = () => {
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      // Get existing addresses
      const saved = localStorage.getItem('bf_addresses');
      const addresses = saved ? JSON.parse(saved) : [];

      // Find and update the address
      const addressIndex = addresses.findIndex((a: any) => a._id === addressId);
      
      if (addressIndex === -1) {
        toast({ title: 'Error', description: 'Address not found', variant: 'destructive' });
        return;
      }

      // Update the address while preserving _id and isDefault
      const updatedAddress = {
        ...addresses[addressIndex],
        ...formData
      };

      addresses[addressIndex] = updatedAddress;
      localStorage.setItem('bf_addresses', JSON.stringify(addresses));

      // If this is the default address, update the default address storage
      if (updatedAddress.isDefault) {
        localStorage.setItem('bf_default_address', JSON.stringify(updatedAddress));
      }

      toast({ title: 'Address Updated', description: 'Your delivery address has been updated' });
      router.push('/checkout/delivery/addresses');
    } catch (err) {
      console.error('Failed to update address:', err);
      toast({ title: 'Error', description: 'Failed to update address. Please try again.', variant: 'destructive' });
    }
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

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-headers)] text-2xl sm:text-3xl uppercase tracking-[2px] mb-4">Address Not Found</h1>
            <Link 
              href="/checkout/delivery/addresses"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-black/80 transition-colors"
            >
              Back to Addresses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/checkout/delivery/addresses" className="inline-flex items-center gap-2 font-[family-name:var(--font-nav)] text-sm text-blue-600 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Addresses
          </Link>
          <h1 className="font-[family-name:var(--font-headers)] text-2xl sm:text-3xl uppercase tracking-[2px]">Update Address</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Form */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-[family-name:var(--font-headers)] text-lg uppercase tracking-[2px] mb-6">Edit Address Details</h2>

              <div className="space-y-6">
                {/* Recipient Name */}
                <div>
                  <label htmlFor="recipientName" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Full name"
                    className={`w-full px-4 py-3 border-2 rounded-lg font-[family-name:var(--font-body)] text-sm focus:outline-none transition-colors ${
                      errors.recipientName ? 'border-red-500' : 'border-black/10 focus:border-black/30'
                    }`}
                  />
                  {errors.recipientName && (
                    <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-body)]">{errors.recipientName}</p>
                  )}
                </div>

                {/* Recipient Mobile Number */}
                <div>
                  <label htmlFor="recipientMobile" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    Recipient Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="font-[family-name:var(--font-body)] text-sm text-black/60">🇿🇦</span>
                      <div className="w-px h-6 bg-black/10" />
                    </div>
                    <input
                      type="tel"
                      id="recipientMobile"
                      name="recipientMobile"
                      value={formData.recipientMobile}
                      onChange={handleChange}
                      placeholder="0XX XXX XXXX"
                      className={`w-full pl-20 pr-4 py-3 border-2 rounded-lg font-[family-name:var(--font-body)] text-sm focus:outline-none transition-colors ${
                        errors.recipientMobile ? 'border-red-500' : 'border-black/10 focus:border-black/30'
                      }`}
                    />
                  </div>
                  {errors.recipientMobile && (
                    <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-body)]">{errors.recipientMobile}</p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label htmlFor="streetAddress" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="streetAddress"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      placeholder="E.g. 12 Ridge Street"
                      className={`w-full px-4 py-3 border-2 rounded-lg font-[family-name:var(--font-body)] text-sm focus:outline-none transition-colors ${
                        errors.streetAddress ? 'border-red-500' : 'border-black/10 focus:border-black/30'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      title="Use current location"
                    >
                      <svg className="w-5 h-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  {errors.streetAddress && (
                    <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-body)]">{errors.streetAddress}</p>
                  )}
                  <p className="mt-1 text-xs text-black/40 font-[family-name:var(--font-body)]">Powered by Google</p>
                </div>

                {/* Complex/Building (Optional) */}
                <div>
                  <label htmlFor="complex" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    Complex / Building <span className="text-black/40">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="complex"
                    name="complex"
                    value={formData.complex}
                    onChange={handleChange}
                    placeholder="Complex or Building Name, unit number or floor"
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-[family-name:var(--font-body)] text-sm focus:border-black/30 focus:outline-none transition-colors"
                  />
                </div>

                {/* Suburb (Optional) */}
                <div>
                  <label htmlFor="suburb" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    Suburb <span className="text-black/40">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="suburb"
                    name="suburb"
                    value={formData.suburb}
                    onChange={handleChange}
                    placeholder="Suburb"
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-[family-name:var(--font-body)] text-sm focus:border-black/30 focus:outline-none transition-colors"
                  />
                </div>

                {/* City / Town */}
                <div>
                  <label htmlFor="city" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City or Town"
                    className={`w-full px-4 py-3 border-2 rounded-lg font-[family-name:var(--font-body)] text-sm focus:outline-none transition-colors ${
                      errors.city ? 'border-red-500' : 'border-black/10 focus:border-black/30'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-body)]">{errors.city}</p>
                  )}
                </div>

                {/* Province */}
                <div>
                  <label htmlFor="province" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-[family-name:var(--font-body)] text-sm appearance-none focus:outline-none transition-colors ${
                        errors.province ? 'border-red-500' : 'border-black/10 focus:border-black/30'
                      }`}
                    >
                      {SA_PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.province && (
                    <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-body)]">{errors.province}</p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block font-[family-name:var(--font-body)] text-sm font-medium mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="XXXX"
                    maxLength={4}
                    className={`w-full px-4 py-3 border-2 rounded-lg font-[family-name:var(--font-body)] text-sm focus:outline-none transition-colors ${
                      errors.postalCode ? 'border-red-500' : 'border-black/10 focus:border-black/30'
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-body)]">{errors.postalCode}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/checkout/delivery/addresses"
                    className="flex-1 py-3 border-2 border-black/10 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider text-center hover:border-black/30 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    onClick={handleUpdateAddress}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors"
                  >
                    Update Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function UpdateAddressPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <Suspense fallback={
        <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-center font-[family-name:var(--font-body)] text-sm">Loading...</p>
          </div>
        </main>
      }>
        <UpdateAddressInner />
      </Suspense>
    </RequireAuth>
  );
}
