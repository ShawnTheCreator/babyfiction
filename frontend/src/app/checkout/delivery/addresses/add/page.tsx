"use client";
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function AddAddressInner() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLon, setMapLon] = useState<number | null>(null);
  
  // Initialize formData state
  const [formData, setFormData] = useState<AddressFormData>({
    type: 'RESIDENTIAL',
    recipientName: '',
    recipientMobile: '',
    streetAddress: '',
    complex: '',
    suburb: '',
    city: '',
    province: 'Gauteng',
    postalCode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const normalizeProvince = (stateName: string): string => {
    const s = stateName.toLowerCase();
    const match =
      SA_PROVINCES.find((p) => s.includes(p.toLowerCase())) ||
      (s.includes('kwazulu') ? 'KwaZulu-Natal' : '');
    return match || formData.province;
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      const a = data?.address || {};

      const street = [a?.house_number, a?.road].filter(Boolean).join(' ');
      const suburb =
        a?.suburb || a?.neighbourhood || a?.residential || a?.quarter || '';
      const city =
        a?.city || a?.town || a?.village || a?.hamlet || a?.municipality || '';
      const provinceRaw = a?.state || '';
      const province = normalizeProvince(provinceRaw);
      const postalCode = a?.postcode || '';
      const complex =
        a?.building || a?.amenity || a?.industrial || a?.commercial || '';

      setFormData((prev) => ({
        ...prev,
        streetAddress: street || prev.streetAddress,
        complex: complex || prev.complex,
        suburb: suburb || prev.suburb,
        city: city || prev.city,
        province,
        postalCode: postalCode || prev.postalCode,
        recipientName: prev.recipientName || (user?.name ?? ''),
      }));
      setMapLat(lat);
      setMapLon(lon);
      toast({ title: 'Location Added', description: 'Address auto-filled from your location.' });
    } catch (err) {
      console.error('Reverse geocode failed:', err);
      toast({
        title: 'Location Error',
        description: 'Could not auto-fill address. Please enter manually.',
        variant: 'destructive',
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator?.geolocation) {
      toast({ title: 'Unsupported', description: 'Geolocation is not available.', variant: 'destructive' });
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try { localStorage.setItem('bf_addr_geo', JSON.stringify({ lat, lon, ts: Date.now() })); } catch {}
        reverseGeocode(lat, lon).finally(() => setGeoLoading(false));
      },
      (err) => {
        console.warn('Geolocation error:', err);
        toast({ title: 'Permission Needed', description: 'Please allow location to auto-fill address.' });
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const latParam = params.get('lat');
      const lonParam = params.get('lon');

      if (latParam && lonParam) {
        const lat = parseFloat(latParam);
        const lon = parseFloat(lonParam);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          reverseGeocode(lat, lon);
          return;
        }
      }

      const saved = localStorage.getItem('bf_addr_geo');
      if (saved) {
        const { lat, lon } = JSON.parse(saved);
        if (typeof lat === 'number' && typeof lon === 'number') {
          reverseGeocode(lat, lon);
          return;
        }
      }
    } catch {}

    if (navigator?.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          reverseGeocode(pos.coords.latitude, pos.coords.longitude).finally(() => setGeoLoading(false));
        },
        () => setGeoLoading(false),
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof AddressFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeChange = (type: 'RESIDENTIAL' | 'BUSINESS') => {
    setFormData(prev => ({ ...prev, type }));
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

  const handleSaveAddress = () => {
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      // Get existing addresses
      const saved = localStorage.getItem('bf_addresses');
      const addresses = saved ? JSON.parse(saved) : [];

      // Create new address with ID
      const newAddress = {
        _id: `addr_${Date.now()}`,
        ...formData,
        isDefault: addresses.length === 0 // First address is default
      };

      // Add to addresses
      addresses.push(newAddress);
      localStorage.setItem('bf_addresses', JSON.stringify(addresses));

      // If it's the first/default address, also save it separately
      if (newAddress.isDefault) {
        localStorage.setItem('bf_default_address', JSON.stringify(newAddress));
      }

      toast({ title: 'Address Saved', description: 'Your delivery address has been saved' });
      router.push('/checkout/delivery/addresses');
    } catch (err) {
      console.error('Failed to save address:', err);
      toast({ title: 'Error', description: 'Failed to save address. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/checkout/delivery/addresses" className="inline-flex items-center gap-2 font-[family-name:var(--font-nav)] text-sm text-blue-600 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Address book
          </Link>
          <h1 className="font-[family-name:var(--font-headers)] text-2xl sm:text-3xl uppercase tracking-[2px]">Delivery</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Form */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-[family-name:var(--font-headers)] text-lg uppercase tracking-[2px] mb-6">Add New Address</h2>

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
                      onClick={handleUseCurrentLocation}
                      disabled={geoLoading}
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
                  <p className="mt-1 text-xs text-black/40 font-[family-name:var(--font-body)]">Powered by OpenStreetMap</p>
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
                    href="/checkout/review"
                    className="flex-1 py-3 border-2 border-black/10 rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider text-center hover:border-black/30 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-[family-name:var(--font-nav)] text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors"
                  >
                    Save Address
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

export default function AddAddressPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <Suspense fallback={
        <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-center font-[family-name:var(--font-body)] text-sm">Loading...</p>
          </div>
        </main>
      }>
        <AddAddressInner />
      </Suspense>
    </RequireAuth>
  );
}