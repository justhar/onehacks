import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

export const PaymentModal = ({
  isOpen,
  snapToken,
  onPaymentResult,
  onClose,
  amount,
  orderId,
}) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen && snapToken) {
      // Listen for messages from iframe
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;
        if (type && type.startsWith("PAYMENT_")) {
          onPaymentResult(data, type);
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [isOpen, snapToken, onPaymentResult]);

  useEffect(() => {
    if (isOpen && snapToken && iframeRef.current) {
      // Load Midtrans Snap in iframe
      const iframe = iframeRef.current;
      iframe.onload = () => {
        iframe.contentWindow.processPayment(snapToken);
      };
    }
  }, [isOpen, snapToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Order #{orderId} • Amount: Rp {amount?.toLocaleString("id-ID")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <iframe
            ref={iframeRef}
            src="/midtrans-snap.html"
            className="w-full h-96 border-0"
            title="Payment"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const PaymentStatus = ({ status, data, onContinue, onRetry }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "failed":
        return <XCircle className="h-8 w-8 text-red-500" />;
      case "pending":
        return <Clock className="h-8 w-8 text-yellow-500" />;
      default:
        return <CreditCard className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "processing":
        return {
          title: "Processing Payment...",
          description: "Please wait while we process your payment.",
        };
      case "success":
        return {
          title: "Payment Successful!",
          description:
            "Your order has been confirmed and will be processed shortly.",
        };
      case "failed":
        return {
          title: "Payment Failed",
          description:
            "There was an issue processing your payment. Please try again.",
        };
      case "pending":
        return {
          title: "Payment Pending",
          description:
            "Your payment is being processed. You will receive updates via email.",
        };
      default:
        return {
          title: "Ready to Pay",
          description: "Click the button below to proceed with payment.",
        };
    }
  };

  const message = getStatusMessage();

  return (
    <Card className="text-center p-8">
      <CardContent className="space-y-4">
        <div className="flex justify-center">{getStatusIcon()}</div>
        <div>
          <h3 className="text-lg font-semibold">{message.title}</h3>
          <p className="text-muted-foreground">{message.description}</p>
        </div>

        {data && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              Transaction ID:{" "}
              <span className="font-mono">
                {data.transaction_id || data.order_id}
              </span>
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center mt-6">
          {status === "success" && (
            <Button onClick={onContinue}>View Order Details</Button>
          )}

          {status === "failed" && <Button onClick={onRetry}>Try Again</Button>}

          {status === "pending" && (
            <Button onClick={onContinue}>Check Order Status</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
