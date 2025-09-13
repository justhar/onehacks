import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowRight, Users, Utensils, Heart } from "lucide-react"
import { Link } from "react-router-dom" 

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background to-muted flex flex-col items-center -mt-8">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Reduce Food Waste,{" "}
              <span className="text-primary">Feed Communities</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Connect restaurants with customers and charities to rescue surplus
              food. Save money, help the environment, and make a difference in
              your community.
            </p>
            </div>
            </div>
          </div>
             
             {/* Feature box */}
             <section className="flex items-center justify-center"> 
          <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"> 
  <div className="grid grid-cols-1 md:grid-cols-3">

    {/* Marketplace */}
    <Link to="/marketplace">
    <div className="flex items-start gap-4 p-8 border-b md:border-b-0 md:border-r hover:bg-emerald-50 transition cursor-pointer">
      <div className="bg-black p-3 rounded-lg">
        <ShoppingCart className="h-10 w-10 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Grab a Meal</h3>
        <p className="text-sm text-gray-600">
          Discover surplus meals from local restaurants at affordable prices. Save money while reducing food waste.
        </p>
      </div>
    </div>
    </Link>

    {/* Donate */}
    <div className="flex items-start gap-4 p-8 border-b md:border-b-0 md:border-r hover:bg-emerald-50 transition cursor-pointer">
      <div className="bg-black p-3 rounded-lg">
        <Heart className="h-8 w-8 text-white" /> 
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Share Your Food</h3>
        <p className="text-sm text-gray-600">
          Share your excess food with communities in need. Every donation helps fight hunger and support charities.
        </p>
      </div>
    </div>

    {/* For Restaurants */}
    <div className="flex items-start gap-4 p-8 hover:bg-emerald-50 transition cursor-pointer">
      <div className="bg-black p-3 rounded-lg">
        <Users className="h-8 w-8 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Work With Us</h3>
        <p className="text-sm text-gray-600">
          Partner with us to minimize food waste, reach more customers, and make a positive impact in your community.
        </p>
      </div>
    </div> 
            </div>
          </div>
          </section> 

           {/* Marquee */}
      <div className="absolute bottom-0 left-0 w-full bg-gray-900 text-white font-semibold py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
        </div>
      </div>

       {/* Marquee */}
      <div className="absolute bottom-0 left-0 w-full bg-gray-900 text-white font-semibold py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
          <span className="mx-8">
            food waste is everyone's problem, but saving food can be everyone's solution
          </span>
        </div>
      </div>
    </section> 
  )
}
