"use client";
import { useState } from "react";
import { Package, Truck, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Track = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [showTracking, setShowTracking] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/orders/${orderNumber}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setOrderData(data);
      setShowTracking(true);
    } catch (err) {
      setOrderData(null);
      setShowTracking(false);
      alert('Order not found');
    }
  };

  const trackingSteps = [
    {
      status: "Order Placed",
      date: "Jan 15, 2024 - 10:30 AM",
      completed: true,
      icon: CheckCircle,
    },
    {
      status: "Processing",
      date: "Jan 15, 2024 - 2:45 PM",
      completed: true,
      icon: Package,
    },
    {
      status: "Shipped",
      date: "Jan 16, 2024 - 9:00 AM",
      completed: true,
      icon: Truck,
    },
    {
      status: "Out for Delivery",
      date: "Jan 18, 2024 - 8:00 AM",
      completed: false,
      icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter your order number to see the latest updates
          </p>
        </div>

        {/* Tracking Form */}
        <Card className="p-8 mb-12 animate-fade-up [animation-delay:100ms]">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="e.g., #ORD-123456"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="mt-2"
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Track Order
            </Button>
          </form>
        </Card>

        {/* Tracking Results */}
        {showTracking && (
          <div className="space-y-8 animate-fade-up">
            {/* Order Info */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order #{orderNumber || "ORD-123456"}</h2>
                  <p className="text-muted-foreground">Estimated delivery: Jan 19, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">R{orderData?.total?.toLocaleString?.() || 0}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6 p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shipping To</p>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm">123 Main St, New York, NY 10001</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Carrier</p>
                  <p className="font-medium">Express Shipping</p>
                  <p className="text-sm">Tracking ID: TRK987654321</p>
                </div>
              </div>
            </Card>

            {/* Tracking Timeline */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-8">Delivery Progress</h3>

              <div className="relative space-y-8">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="relative flex items-start gap-4">
                      {/* Connector Line */}
                      {index < trackingSteps.length - 1 && (
                        <div
                          className={`absolute left-[18px] top-12 w-0.5 h-full ${
                            step.completed ? "bg-accent" : "bg-border"
                          }`}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                          step.completed
                            ? "bg-accent border-accent text-accent-foreground"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <h4
                          className={`font-semibold mb-1 ${
                            step.completed ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.status}
                        </h4>
                        <p className="text-sm text-muted-foreground">{step.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Order Items</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80"
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Premium Sneakers</h4>
                    <p className="text-sm text-muted-foreground">Size: M • Qty: 1</p>
                    <p className="font-bold mt-2">$299</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                    <img
                      src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80"
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Designer Jacket</h4>
                    <p className="text-sm text-muted-foreground">Size: L • Qty: 1</p>
                    <p className="font-bold mt-2">$599</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
