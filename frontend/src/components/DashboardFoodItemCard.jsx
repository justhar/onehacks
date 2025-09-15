"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Star, Edit, Trash2, Heart } from "lucide-react";

export function DashboardFoodItemCard({
  item,
  onEdit,
  onDelete,
  isDonation = false,
}) {
  const discountPercentage = item.discount ? Math.round(item.discount) : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {discountPercentage > 0 && !isDonation && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            {discountPercentage}% OFF
          </Badge>
        )}
        {isDonation && (
          <Badge className="absolute top-2 right-2 text-white">Donation</Badge>
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDonation ? (
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold ">FREE</span>
                </div>
              ) : discountPercentage > 0 ? (
                <>
                  <span className="text-lg font-bold text-primary">
                    Rp {item.discountedPrice}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    Rp {item.originalprice}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-primary">
                  Rp {item.discountedPrice}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {item.quantity} available
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            Added: {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
