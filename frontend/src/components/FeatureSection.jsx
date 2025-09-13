"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideShoppingBasket, Heart, Truck, DollarSign, Leaf, Users } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";

export default function FeatureSection() {
  const features = [
    {
      icon: <LucideShoppingBasket className="w-20 h-20 text-primary" />,
      title: "Smart Marketplace",
      description: "Browse discounted surplus food from local restaurants. Fresh ingredients at great prices.", 
    },
    {
      icon: <Heart className="w-30 h-30 text-primary" />,
      title: "Easy Donations",
      description: "Restaurants can quickly donate excess food to local charities and food banks.",
    },
    {
      icon: <Truck className="w-30 h-30 text-primary" />,
      title: "Delivery Options",
      description: "Convenient delivery service for both marketplace purchases and charitable donations.",
    },
    {
      icon: <DollarSign className="w-30 h-30 text-primary" />,
      title: "Cost Effective",
      description: "Save money on quality food while helping restaurants reduce waste disposal costs.",
    },
    {
      icon: <Leaf className="w-30 h-30 text-primary" />,
      title: "Environmental Impact",
      description: "Reduce food waste and lower carbon footprint by keeping food out of landfills.",
    },
    {
      icon: <Users className="w-30 h-30 text-primary" />,
      title: "Community Building",
      description: "Connect restaurants, customers, and charities to strengthen local food networks.",
    },
  ]

  return (
    <section className="py-20 bg-background flex flex-col items-center">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-4xl font-extrabold text-foreground mb-4">How FoodSaver Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it simple to rescue food, save money, and help your community
          </p>
        </div>
        <Swiper spaceBetween={50} 
        slidesPerView={1} 
        navigation= {false}
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}> 
        {features.map((feature, index) => (
  <SwiperSlide key={index}>
  <div className="flex justify-center items-center gap-10">
    {/* Teks */}
    <div className="flex flex-col justify-center text-left w-80 h-40">
      <h4 className="text-3xl font-bold mb-4">
        {feature.title}
      </h4>
      <p className="text-lg text-gray-600 mb-6">
        {feature.description}
      </p>
    </div>  

    {/* Icon */}
    <div className="flex justify-center items-center">
      <div className="w-46 h-46 bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
        {feature.icon}
      </div>
    </div>
  </div>
</SwiperSlide>
          ))}
        </Swiper>
        </div> 
    </section>
  );
}


