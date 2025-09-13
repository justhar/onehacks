"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Truck, Heart, Calendar } from "lucide-react"

export function DonationCard({ donation, onClaim }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img src={donation.image || "/placeholder.svg"} alt={donation.foodName} className="w-full h-48 object-cover" />
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">FREE</Badge>
        <Badge variant="secondary" className="absolute top-2 left-2">
          {donation.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{donation.foodName}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{donation.description}</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-primary">
              {donation.quantity} {donation.unit}
            </span>
            <span className="text-muted-foreground">Posted {donation.createdAt}</span>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{donation.restaurant}</span>
              <span>•</span>
              <span>{donation.distance}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Expires {donation.expiryDate}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pickup available at {donation.pickupTime}</span>
            </div>

            {donation.deliveryOffered && (
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>
                  Delivery available
                  {donation.deliveryCost ? ` ($${donation.deliveryCost})` : " (Free)"}
                </span>
              </div>
            )}
          </div>

          {donation.dietaryInfo.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {donation.dietaryInfo.map((info) => (
                <Badge key={info} variant="outline" className="text-xs">
                  {info}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => onClaim?.(donation)}>
          <Heart className="h-4 w-4 mr-2" />
          Claim Donation
        </Button>
      </CardFooter>
    </Card>
  )
} 
 