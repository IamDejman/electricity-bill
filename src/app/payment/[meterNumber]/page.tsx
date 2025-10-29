'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCustomerByMeterNumber } from '@/lib/mockData';
import { generateReference, getBankDetails, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function PaymentInstructionsPage() {
  const [customerData, setCustomerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [viewHistoryLoading, setViewHistoryLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'confirming' | 'received' | 'generating' | 'success'>('idle');
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();
  const params = useParams();
  const meterNumber = params.meterNumber as string;
  const { showToast } = useToast();

  useEffect(() => {
    const customer = getCustomerByMeterNumber(meterNumber);
    if (customer) {
      setCustomerData(customer);
    }
    setIsLoading(false);
  }, [meterNumber]);

  const handleCopyAccount = async () => {
    const bankDetails = getBankDetails();
    const success = await copyToClipboard(bankDetails.account);
    if (success) {
      showToast('Account number copied!');
    }
  };

  const handleCopyReference = async () => {
    if (!customerData) return;
    const reference = generateReference(customerData.customer.customerName, meterNumber);
    const success = await copyToClipboard(reference);
    if (success) {
      showToast('Reference copied!');
    }
  };

  const handleTransfer = async () => {
    setTransferLoading(true);
    setPaymentState('confirming');
    
    try {
      // Simulate payment confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentState('received');
      
      // Simulate payment received
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPaymentState('generating');
      
      // Start countdown for token generation
      let countdownValue = 10;
      setCountdown(countdownValue);
      
      const countdownInterval = setInterval(() => {
        countdownValue -= 1;
        setCountdown(countdownValue);
        
        if (countdownValue <= 0) {
          clearInterval(countdownInterval);
          generateAndSaveTransaction();
        }
      }, 1000);
      
    } catch (error) {
      showToast('Payment failed. Please try again.');
      setPaymentState('idle');
      setTransferLoading(false);
    }
  };

  const generateAndSaveTransaction = () => {
    // Generate a new transaction and add it to localStorage
    const newTransaction = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString(),
      amount: Math.floor(Math.random() * 9000) + 1000, // Random amount between 1000-10000
      token: generateToken(),
      status: 'success' as const,
      meterNumber
    };
    
    // Get existing transactions and add new one
    const existingTransactions = JSON.parse(localStorage.getItem(`transactions_${meterNumber}`) || '[]');
    const updatedTransactions = [newTransaction, ...existingTransactions];
    localStorage.setItem(`transactions_${meterNumber}`, JSON.stringify(updatedTransactions));
    
    setPaymentState('success');
    showToast('Token generated successfully!');
    
    // Navigate to success page after a short delay
    setTimeout(() => {
      router.push(`/success/${meterNumber}`);
    }, 2000);
  };

  const generateToken = () => {
    // Generate 20-digit token in format: XXXX-XXXX-XXXX-XXXX-XXXX
    const digits = '0123456789';
    let token = '';
    for (let i = 0; i < 20; i++) {
      token += digits[Math.floor(Math.random() * digits.length)];
    }
    return token.replace(/(.{4})/g, '$1-').slice(0, -1); // Add dashes every 4 digits
  };

  const handleViewHistory = () => {
    setViewHistoryLoading(true);
    setTimeout(() => {
      router.push(`/transactions/${meterNumber}`);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Meter Not Found</h1>
        <p className="text-gray-600">The meter number you entered was not found.</p>
        <Button onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  const bankDetails = getBankDetails();
  const reference = generateReference(customerData.customer.customerName, meterNumber);

  // Payment state UI
  const renderPaymentState = () => {
    switch (paymentState) {
      case 'confirming':
        return (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c03438] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirming Payment</h3>
              <p className="text-gray-600">Please wait while we verify your payment...</p>
            </div>
          </Card>
        );
      
      case 'received':
        return (
          <Card>
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Received</h3>
              <p className="text-gray-600">Your payment has been confirmed successfully!</p>
            </div>
          </Card>
        );
      
      case 'generating':
        return (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c03438] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Token</h3>
              <p className="text-gray-600 mb-2">You'll receive your token shortly...</p>
              <div className="text-2xl font-bold text-[#c03438]">{countdown}s</div>
            </div>
          </Card>
        );
      
      case 'success':
        return (
          <Card>
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Token Generated!</h3>
              <p className="text-gray-600">Your token has been generated successfully. Redirecting...</p>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Back Button */}
      <div className="flex items-center mb-3">
        <button 
          onClick={() => router.push(`/meter/${meterNumber}`)}
          className="flex items-center text-[#c03438] hover:text-[#a02a2e] transition-colors py-2 -ml-2"
        >
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base font-medium">Back</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {paymentState !== 'idle' ? (
          renderPaymentState()
        ) : (
          <Card>
          <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 text-center">Make Payment</h1>
              <p className="text-gray-600 text-sm">
                Make a transfer to the dedicated bank account reserved for your meter below whenever you need to buy token
              </p>
            </div>

            {/* Bank Details Card */}
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 space-y-4">
              {/* Bank Name, Account Number, and Account Name */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-center space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">{bankDetails.bank}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <p className="text-xl font-bold text-gray-900 font-mono tracking-wider">{bankDetails.account}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyAccount}
                      className="px-2 py-1"
                      style={{backgroundColor: '#c03438', borderColor: '#c03438', color: 'white'}}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account name</p>
                    <p className="text-gray-900 font-mono text-xs break-all">{reference}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                size="lg"
                style={{backgroundColor: '#c03438'}}
                loading={transferLoading}
                onClick={handleTransfer}
              >
                I've Made the Transfer
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-amber-800 mb-1">Important Instructions</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Minimum amount: ₦1,000</li>
                    <li>• Token will be sent to your email and phone after payment confirmation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                className="w-full" 
                size="lg"
                style={{backgroundColor: '#f4b431', color: '#373435'}}
                loading={viewHistoryLoading}
                onClick={handleViewHistory}
              >
                View Receipts and Tokens
              </Button>
            </div>
          </div>
        </Card>
        )}
      </div>

      {/* Help Section */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 mb-2">Need help?</p>
        <a
          href="https://wa.me/2348089932753"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          WhatsApp: 08089932753
        </a>
      </div>
    </div>
  );
}
