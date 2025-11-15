import Link from "next/link";

export default function HoodiesSizeGuidePage() {
  // ... existing code ...
  return (
    <div className="min-h-screen bg-white pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px]">
      <div className="max-w-[1200px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-[family-name:var(--font-nav)] text-sm text-black/60 hover:text-black transition-colors mb-8"
        >
          ← Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-headers)] text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-[2px]">
            Hoodies Size Guide
          </h1>
          <div className="h-[2px] bg-black w-24 mt-4"></div>
          <p className="font-[family-name:var(--font-body)] text-sm text-gray-700 mt-6 max-w-2xl">
            Use this guide to select your ideal hoodie fit. Measurements are
            approximate and may vary slightly by style. If you’re between sizes,
            size up for a relaxed fit.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Chest (cm)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Length (cm)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { label: "S", chest: "92–97", length: "66–68" },
                { label: "M", chest: "98–103", length: "68–70" },
                { label: "L", chest: "104–109", length: "70–72" },
                { label: "XL", chest: "110–115", length: "72–74" },
                { label: "2XL", chest: "116–121", length: "74–76" },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 font-semibold">{row.label}</td>
                  <td className="px-4 py-3">{row.chest}</td>
                  <td className="px-4 py-3">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <h2 className="font-[family-name:var(--font-headers)] text-xl font-bold uppercase tracking-[2px] mb-3">
            How to Measure
          </h2>
          <ul className="list-disc list-inside font-[family-name:var(--font-body)] text-sm text-gray-700 space-y-2">
            <li>
              Chest: Measure around the fullest part of your chest, keeping the
              tape parallel to the floor.
            </li>
            <li>
              Length: Measure from the highest point on the shoulder down to the
              hem.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
  // ... existing code ...
}