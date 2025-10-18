"use client";
import { useState } from "react";
import { Package, ShoppingCart, Users, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const stats = [
    { label: "Total Revenue", value: "R1,992,000", icon: TrendingUp, change: "+12.5%" },
    { label: "Orders", value: "1,234", icon: ShoppingCart, change: "+8.2%" },
    { label: "Products", value: "156", icon: Package, change: "+3" },
    { label: "Customers", value: "5,678", icon: Users, change: "+15.3%" },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      amount: "R4,799",
      status: "Delivered",
      date: "Jan 18, 2024",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      amount: "R9,599",
      status: "Shipped",
      date: "Jan 17, 2024",
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      amount: "R7,199",
      status: "Processing",
      date: "Jan 16, 2024",
    },
    {
      id: "ORD-004",
      customer: "Sarah Williams",
      amount: "R12,799",
      status: "Delivered",
      date: "Jan 15, 2024",
    },
  ];

  const topProducts = [
    {
      name: "Premium Sneakers",
      sales: 145,
      revenue: "R693,680",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
    },
    {
      name: "Designer Jacket",
      sales: 98,
      revenue: "R940,702",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80",
    },
    {
      name: "Classic Watch",
      sales: 87,
      revenue: "R626,313",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/10 text-green-500";
      case "Shipped":
        return "bg-blue-500/10 text-blue-500";
      case "Processing":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-secondary/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center mb-12 animate-fade-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-6 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-green-500">{stat.change}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="animate-fade-up">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card className="animate-fade-up">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">Recent Orders</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="font-bold">{order.amount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="animate-fade-up">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">Top Products</h2>
              </div>
              <div className="p-6 space-y-6">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-6 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card className="p-12 text-center animate-fade-up">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Customer Management</h3>
              <p className="text-muted-foreground">
                Customer management features coming soon
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
