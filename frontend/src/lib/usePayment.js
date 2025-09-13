import { useState, useCallback } from 'react';
import { api } from './api';

export const usePayment = () => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed, pending
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  const processPayment = useCallback(async (token, orderData) => {
    try {
      setPaymentStatus('processing');
      setError(null);
      
      // Create order first
      const orderResponse = await api.createOrder(token, orderData);
      
      if (orderResponse.error) {
        throw new Error(orderResponse.error);
      }

      // Return payment data for Snap
      return {
        snapToken: orderResponse.snapToken,
        orderId: orderResponse.order.id,
        redirectUrl: orderResponse.snapRedirectUrl
      };
    } catch (err) {
      setError(err.message);
      setPaymentStatus('failed');
      throw err;
    }
  }, []);

  const handlePaymentResult = useCallback((result, type) => {
    setPaymentData(result);
    
    switch (type) {
      case 'PAYMENT_SUCCESS':
        setPaymentStatus('success');
        break;
      case 'PAYMENT_PENDING':
        setPaymentStatus('pending');
        break;
      case 'PAYMENT_ERROR':
        setPaymentStatus('failed');
        break;
      case 'PAYMENT_CLOSED':
        setPaymentStatus('idle');
        break;
      default:
        setPaymentStatus('idle');
    }
  }, []);

  const resetPayment = useCallback(() => {
    setPaymentStatus('idle');
    setPaymentData(null);
    setError(null);
  }, []);

  return {
    paymentStatus,
    paymentData,
    error,
    processPayment,
    handlePaymentResult,
    resetPayment
  };
};
