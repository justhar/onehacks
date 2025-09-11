import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Heart, Truck, DollarSign, Leaf, Users } from "lucide-react"

export default function FeatureSection() {
  const features = [
    {
      icon: ShoppingCart,
      title: "Smart Marketplace",
      description: "Browse discounted surplus food from local restaurants. Fresh ingredients at great prices.",
    },
    {
      icon: Heart,
      title: "Easy Donations",
      description: "Restaurants can quickly donate excess food to local charities and food banks.",
    },
    {
      icon: Truck,
      title: "Delivery Options",
      description: "Convenient delivery service for both marketplace purchases and charitable donations.",
    },
    {
      icon: DollarSign,
      title: "Cost Effective",
      description: "Save money on quality food while helping restaurants reduce waste disposal costs.",
    },
    {
      icon: Leaf,
      title: "Environmental Impact",
      description: "Reduce food waste and lower carbon footprint by keeping food out of landfills.",
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Connect restaurants, customers, and charities to strengthen local food networks.",
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How FoodSaver Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it simple to rescue food, save money, and help your community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

