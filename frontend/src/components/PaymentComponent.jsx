import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function PaymentComponent({ order, onPaymentSuccess }) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [snapToken, setSnapToken] = useState(null);
  const [error, setError] = useState("");

  const handleCreatePayment = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.createPayment(token, order.id);

      if (response.error) {
        setError(response.error);
        return;
      }

      setSnapToken(response.snapToken);

      // Load Midtrans Snap
      setTimeout(() => {
        if (window.snap) {
          window.snap.embed(response.snapToken, {
            embedId: "snap-container",
            onSuccess: async function (result) {
              onPaymentSuccess?.(result);
            },
            onPending: function (result) {
              // Payment pending
            },
            onError: function (result) {
              setError("Payment failed. Please try again.");
            },
            onClose: function () {
              // Payment popup closed
            },
          });
        } else {
          setError("Payment system not loaded. Please refresh the page.");
        }
      }, 1000);
    } catch (error) {
      setError("Failed to create payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load Midtrans Snap script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY ||
        "SB-Mid-client-YOUR_CLIENT_KEY"
    );

    script.onload = () => {
      // Midtrans Snap script loaded successfully
    };

    script.onerror = () => {
      setError("Failed to load payment system. Please refresh the page.");
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-lg font-semibold">
              Rp {parseFloat(order.totalAmount).toLocaleString("id-ID")}
            </p>
          </div>
          <Badge variant="destructive">Unpaid</Badge>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!snapToken ? (
          <Button
            onClick={handleCreatePayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Payment...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Complete your payment below:
            </p>
            <div
              id="snap-container"
              className="border rounded-lg bg-white"
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
