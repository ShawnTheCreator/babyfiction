"use client";
import Image from 'next/image';
import { Star, Shield, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      {/* Grain Texture Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 mix-blend-luminosity">
        <div className="absolute inset-0 bg-[url('/assets/images/banners/background-image.jpg')] bg-repeat opacity-20" />
      </div>

      <main className="relative bg-white">
        {/* About Page Content */}
        <section className="mt-[140px] px-4 sm:px-6 md:px-12 lg:px-[50px] py-12 sm:py-16 md:py-20 min-h-[calc(100vh-140px)]">
          <div className="max-w-[1200px] mx-auto">
            {/* About Container */}
            <div className="bg-white/90 backdrop-blur-[10px] rounded-2xl p-6 sm:p-8 md:p-12 lg:p-[60px] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-[60px] items-start">
                {/* Left Column - Image */}
                <div className="relative order-2 lg:order-1">
                  <div className="absolute -top-5 -left-5 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] bg-yellow-300/30 rounded-full -z-10" />
                  <div className="relative w-full rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                    <img
                      src="/assets/images/gallery/FashionDesign1.jpg"
                      alt="BabyFictions Streetwear"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>

                {/* Right Column - Content */}
                <div className="flex flex-col gap-6 md:gap-8 order-1 lg:order-2">
                  <h1 className="font-[family-name:var(--font-headers)] text-3xl sm:text-4xl md:text-5xl lg:text-[48px] leading-[1.2] text-black mb-0">
                    About Us
                  </h1>

                  {/* History Section */}
                  <div className="mb-0">
                    <h2 className="font-[family-name:var(--font-accent)] text-xl sm:text-2xl md:text-[24px] font-semibold text-black mb-3 md:mb-[15px] tracking-[0.5px]">
                      History
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-sm sm:text-base md:text-[15px] leading-[1.8] text-[#333]">
                      BabyFictions is a pioneering South African streetwear brand that has been changing the fashion landscape since 2016. 
                      The brand was born from a passion to create authentic, high-quality streetwear that reflects the vibrant energy 
                      and diverse culture of South Africa. What started as a small collection has grown into a movement, bringing 
                      together style-conscious individuals who appreciate bold designs and quality craftsmanship.
                    </p>
                  </div>

                  {/* Why Us Section */}
                  <div className="mb-0">
                    <h2 className="font-[family-name:var(--font-accent)] text-xl sm:text-2xl md:text-[24px] font-semibold text-black mb-3 md:mb-[15px] tracking-[0.5px]">
                      Why Us
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-sm sm:text-base md:text-[15px] leading-[1.8] text-[#333]">
                      At BabyFictions, we believe in authentic self-expression through fashion. Our designs combine urban aesthetics with 
                      South African flair, creating pieces that stand out from the crowd. We use premium materials and pay attention 
                      to every detail, ensuring that each item not only looks great but lasts. Our commitment to quality, creativity, 
                      and community sets us apart in the streetwear scene.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission & Vision Cards - Full Width Below */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mt-6 lg:mt-8">
                {/* Mission Card */}
                <div className="bg-[#f8f8f8]/60 p-5 md:p-6 lg:p-[25px] rounded-lg border-l-4 border-black transition-all duration-300 hover:bg-[#f8f8f8]/90 hover:translate-x-1">
                  <h3 className="font-[family-name:var(--font-nav)] text-sm md:text-[16px] font-semibold text-black mb-2 md:mb-[10px] uppercase tracking-wide">
                    Our Mission
                  </h3>
                  <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm md:text-[14px] leading-[1.6] text-[#555]">
                    To empower individuals through bold, authentic streetwear that celebrates creativity and self-expression 
                    while maintaining the highest standards of quality and sustainability.
                  </p>
                </div>

                {/* Vision Card */}
                <div className="bg-[#f8f8f8]/60 p-5 md:p-6 lg:p-[25px] rounded-lg border-l-4 border-black transition-all duration-300 hover:bg-[#f8f8f8]/90 hover:translate-x-1">
                  <h3 className="font-[family-name:var(--font-nav)] text-sm md:text-[16px] font-semibold text-black mb-2 md:mb-[10px] uppercase tracking-wide">
                    Our Vision
                  </h3>
                  <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm md:text-[14px] leading-[1.6] text-[#555]">
                    To become Africa&apos;s leading streetwear brand, recognized globally for our unique designs, quality craftsmanship, 
                    and positive impact on the fashion industry and our community.
                  </p>
                </div>
              </div>

              {/* Values Section */}
              <div className="mt-12 md:mt-16 lg:mt-[60px] pt-8 md:pt-10 lg:pt-[40px] border-t-2 border-[#e0e0e0]">
                <h2 className="font-[family-name:var(--font-headers)] text-2xl sm:text-3xl md:text-[36px] text-center text-black mb-6 md:mb-8 lg:mb-[30px]">
                  Our Values
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-[30px]">
                  {/* Authenticity Value */}
                  <div className="text-center p-5 md:p-6 lg:p-[25px] bg-white/50 rounded-lg transition-all duration-300 hover:bg-white/80 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-center mb-3 md:mb-[15px]">
                      <Star className="w-8 h-8 md:w-9 md:h-9 text-black" />
                    </div>
                    <h3 className="font-[family-name:var(--font-nav)] text-sm md:text-[16px] font-semibold text-black mb-2 md:mb-[10px] uppercase tracking-wide">
                      Authenticity
                    </h3>
                    <p className="font-[family-name:var(--font-body)] text-xs sm:text-[13px] leading-relaxed text-[#666]">
                      We stay true to our roots, creating designs that reflect genuine South African streetwear culture.
                    </p>
                  </div>

                  {/* Quality Value */}
                  <div className="text-center p-5 md:p-6 lg:p-[25px] bg-white/50 rounded-lg transition-all duration-300 hover:bg-white/80 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-center mb-3 md:mb-[15px]">
                      <Shield className="w-8 h-8 md:w-9 md:h-9 text-black" />
                    </div>
                    <h3 className="font-[family-name:var(--font-nav)] text-sm md:text-[16px] font-semibold text-black mb-2 md:mb-[10px] uppercase tracking-wide">
                      Quality
                    </h3>
                    <p className="font-[family-name:var(--font-body)] text-xs sm:text-[13px] leading-relaxed text-[#666]">
                      Every piece is crafted with premium materials and attention to detail for lasting wear.
                    </p>
                  </div>

                  {/* Community Value */}
                  <div className="text-center p-5 md:p-6 lg:p-[25px] bg-white/50 rounded-lg transition-all duration-300 hover:bg-white/80 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-center mb-3 md:mb-[15px]">
                      <Users className="w-8 h-8 md:w-9 md:h-9 text-black" />
                    </div>
                    <h3 className="font-[family-name:var(--font-nav)] text-sm md:text-[16px] font-semibold text-black mb-2 md:mb-[10px] uppercase tracking-wide">
                      Community
                    </h3>
                    <p className="font-[family-name:var(--font-body)] text-xs sm:text-[13px] leading-relaxed text-[#666]">
                      We build connections, support local talent, and give back to the communities we serve.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
