"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { name: "Premium Sneakers", price: 4799, quantity: 1, size: "M" },
            { name: "Designer Jacket", price: 9599, quantity: 1, size: "L" },
          ],
          subtotal: 14398,
          shipping: 320,
          total: 16033,
          customer: {},
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const order = await res.json();
      toast({ title: "Order placed successfully!" });
      router.push(`/track?id=${order._id}`);
    } catch (err) {
      console.error(err);
      toast({ title: "Order failed", description: "Please try again." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-[1000px] mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 animate-fade-up">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card className="p-6 animate-fade-up">
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required className="mt-2" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required className="mt-2" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input id="zipCode" required className="mt-2" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" required className="mt-2" />
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6 animate-fade-up [animation-delay:100ms]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Payment Details</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Secure Payment
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative mt-2">
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" required className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" required className="mt-2" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input id="cardName" required className="mt-2" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-32 animate-fade-up [animation-delay:200ms]">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Premium Sneakers (1x)</span>
                      <span>R4,799</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Designer Jacket (1x)</span>
                      <span>R9,599</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">R14,398</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">R320</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">R1,315</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">R16,033</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Place Order"}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
