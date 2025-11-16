"use client";
import { useState } from "react";
import Image from "next/image";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryItems = [
    { src: "/assets/images/gallery/FashionDesign1.jpg", size: "large", title: "Fashion Design 1" },
    { src: "/assets/images/gallery/fashionDesign2Gents.jpg", size: "medium", title: "Gents Fashion" },
    { src: "/assets/images/gallery/FashionDesign3.jpg", size: "medium", title: "Fashion Design 3" },
    { src: "/assets/images/gallery/FashionCold.jpg", size: "small", title: "Fashion Cold" },
    { src: "/assets/images/gallery/FashionDesign1Meddie.jpg", size: "wide", title: "Fashion Design Meddie" },
    { src: "/assets/images/gallery/FashionDesign2.jpg", size: "medium", title: "Fashion Design 2" },
    { src: "/assets/images/gallery/NiceNeutral.jpg", size: "small", title: "Nice Neutral" },
    { src: "/assets/images/gallery/FashionDesign4.jpg", size: "large", title: "Fashion Design 4" },
    { src: "/assets/images/gallery/schoolevent1.jpg", size: "medium", title: "School Event 1" },
    { src: "/assets/images/gallery/schoolevent2girls.jpg", size: "small", title: "School Event Girls" },
    { src: "/assets/images/gallery/schoolevent2guys.jpg", size: "medium", title: "School Event Guys" },
    { src: "/assets/images/gallery/sigh.jpg", size: "small", title: "Sigh" },
    { src: "/assets/images/gallery/fillersmall.jpg", size: "small", title: "Filler" },
    { src: "/assets/images/gallery/siyastylist2025_11_16_04_09_58ecced326-e3fc-49eb-a639-d421206e2cbd.jpg", size: "wide", title: "Stylist Collection" },
  ];

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "large":
        return "col-span-2 row-span-2";
      case "wide":
        return "col-span-2 row-span-1";
      case "tall":
        return "col-span-1 row-span-2";
      case "medium":
        return "col-span-1 row-span-1";
      case "small":
        return "col-span-1 row-span-1";
      default:
        return "col-span-1 row-span-1";
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="text-center py-12 md:py-16 px-4">
        <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm uppercase tracking-wider text-gray-600 mb-4">
          BabyFictions
        </p>
        <h1 className="font-[family-name:var(--font-headers)] text-4xl md:text-5xl lg:text-6xl tracking-wider uppercase mb-6">
          Gallery
        </h1>
        <div className="w-24 h-1 bg-black mx-auto mb-6" />
        <p className="font-[family-name:var(--font-body)] text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
          Explore our collection of designs and fashion moments
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 sm:px-6 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className={`${getSizeClasses(item.size)} relative group overflow-hidden rounded-lg cursor-pointer`}
                onClick={() => setSelectedImage(item.src)}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Gallery image"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </main>
  );
}
