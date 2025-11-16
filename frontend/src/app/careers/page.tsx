"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function CareersPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
          {/* Emoji */}
          <div className="mb-8 text-8xl">
            😞
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              No Current Openings
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We appreciate your interest in joining the BabyFictions team! At this time, we don't have any open positions available.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Stay Connected</h3>
              <p className="text-gray-600 text-sm mb-4">
                We're always growing and new opportunities may arise. Follow us on social media or check back later for future job openings.
              </p>
              <p className="text-gray-600 text-sm">
                For general inquiries, feel free to reach out at{" "}
                <a href="mailto:babyfictions2021@gmail.com" className="text-blue-600 hover:underline">
                  babyfictions2021@gmail.com
                </a>
              </p>
            </div>

            {/* Call to Action */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8">
                  Back to Home
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="px-8">
                  Shop Our Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Thank you for your interest in BabyFictions</p>
        </div>
      </div>
    </main>
  );
}
