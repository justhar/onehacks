"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router";

export function FoodItemCard({ item }) {
  const discountPercentage = Math.round(
    ((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100
  );

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            {discountPercentage}% OFF
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {item.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {item.name}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{item.rating}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{item.restaurant}</span>
            <span>•</span>
            <span>{item.distance}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">
                Rp{item.discountedPrice}
              </span>
              {discountPercentage > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  Rp{item.originalPrice}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {item.quantity} available
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={item.quantity === 0}
          asChild={item.quantity > 0}
        >
          {item.quantity === 0 ? (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sold Out
            </>
          ) : (
            <Link to={`/checkout/${item.id}`}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order Now
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
