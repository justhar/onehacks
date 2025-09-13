# Midtrans Payment Integration Setup Guide

## Overview
This implementation provides a complete payment flow using Midtrans Snap with the following features:
- Popup payment modal
- Real-time payment status tracking
- Webhook handling for payment notifications
- Proper error handling and retry mechanisms

## Setup Steps

### 1. Environment Variables
Add these to your backend `.env` file:
```env
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### 2. Update Midtrans Snap HTML
Edit `frontend/public/midtrans-snap.html` and replace `YOUR_CLIENT_KEY` with your actual Midtrans client key:
```html
<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="YOUR_ACTUAL_CLIENT_KEY"></script>
```

For production, change the URL to:
```html
<script src="https://app.midtrans.com/snap/snap.js" data-client-key="YOUR_ACTUAL_CLIENT_KEY"></script>
```

### 3. Midtrans Dashboard Configuration
In your Midtrans dashboard, configure:

**Payment Notification URL (Webhook):**
- Sandbox: `http://your-domain.com/api/webhook/midtrans`
- Production: `https://your-domain.com/api/webhook/midtrans`

**Finish Redirect URL:**
- `http://localhost:5173/order/{order_id}` (for development)

**Error Redirect URL:**
- `http://localhost:5173/checkout/{product_id}` (for development)

**Unfinish Redirect URL:**
- `http://localhost:5173/marketplace`

### 4. Install Required Dependencies
```bash
# Backend (if not already installed)
npm install crypto

# Frontend - Install toast notifications (already done)
npx shadcn@latest add sonner
```

## Payment Flow Explanation

### 1. User Journey
1. User adds product to cart and goes to checkout
2. User fills delivery and contact information
3. User clicks "Place Order"
4. Order is created in backend with 'pending' status
5. Midtrans Snap token is generated
6. Payment modal opens with Midtrans payment form
7. User completes payment
8. Payment status is updated via webhook
9. User sees success/failure status
10. User is redirected to order details

### 2. Technical Flow

**Frontend (`Checkout.jsx`):**
- Uses `usePayment` hook for state management
- `PaymentModal` component handles Snap integration
- `PaymentStatus` component shows payment results

**Backend (`orderRoute.ts`):**
- Creates order with 'pending' status
- Generates Snap token with transaction details
- Returns both token and redirect URL

**Webhook (`webhookRoute.ts`):**
- Receives payment notifications from Midtrans
- Verifies signature for security
- Updates payment and order status in database

### 3. Payment States
- `idle` - Initial state
- `processing` - Order being created/payment in progress
- `success` - Payment completed successfully
- `failed` - Payment failed or rejected
- `pending` - Payment pending (bank transfer, etc.)

## Security Features

### 1. Signature Verification
The webhook verifies Midtrans signatures to ensure requests are authentic:
```typescript
const signatureString = orderId + statusCode + grossAmount + serverKey;
const hash = crypto.createHash('sha512').update(signatureString).digest('hex');
```

### 2. CORS Configuration
Backend allows only your frontend domain to make requests.

### 3. Token-based Authentication
All API calls require valid JWT tokens.

## Error Handling

### 1. Payment Failures
- User sees clear error messages
- Retry button available for failed payments
- Fallback to order listing if needed

### 2. Network Issues
- Timeout handling in payment modal
- Graceful degradation if Snap script fails
- Clear user feedback for all states

### 3. Webhook Failures
- Signature verification prevents fake notifications
- Database transactions ensure data consistency
- Proper HTTP status codes returned

## Testing

### 1. Sandbox Testing
Use Midtrans sandbox with test credit cards:
- Success: `4811 1111 1111 1114`
- Failure: `4911 1111 1111 1113`
- CVV: `123`, Exp: `12/25`

### 2. Payment Status Testing
Test different payment methods:
- Credit Card (immediate)
- Bank Transfer (pending → success)
- E-wallet (redirect flow)

## Production Checklist

- [ ] Update Midtrans script URL to production
- [ ] Set production server/client keys
- [ ] Configure production webhook URL
- [ ] Set up SSL certificate
- [ ] Test with real payment methods
- [ ] Set up monitoring for webhook failures
- [ ] Configure proper error logging

## API Endpoints

### Payment
- `POST /api/orderRoute` - Create order and get Snap token
- `GET /api/webhook/payment-status/:orderId` - Get payment status
- `POST /api/webhook/midtrans` - Webhook for payment notifications

## Troubleshooting

### Common Issues
1. **"snap is not defined"** - Check if Midtrans script is loaded
2. **Webhook not triggered** - Verify URL in Midtrans dashboard
3. **Invalid signature** - Check server key in environment variables
4. **CORS errors** - Ensure frontend URL is in CORS config

### Debug Tips
- Check browser console for JavaScript errors
- Monitor network tab for failed API calls
- Check backend logs for webhook processing
- Verify payment status in Midtrans dashboard
