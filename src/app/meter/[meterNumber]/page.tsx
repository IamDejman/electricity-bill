'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCustomerByMeterNumber } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export default function MeterDetailsPage() {
  const [customerData, setCustomerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyTokenLoading, setBuyTokenLoading] = useState(false);
  const [viewHistoryLoading, setViewHistoryLoading] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const meterNumber = params.meterNumber as string;

  useEffect(() => {
    const customer = getCustomerByMeterNumber(meterNumber);
    if (customer) {
      setCustomerData(customer);
    }
    setIsLoading(false);
  }, [meterNumber]);

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

  const { customer } = customerData;

  const handleBuyToken = () => {
    setBuyTokenLoading(true);
    setTimeout(() => {
      router.push(`/payment/${meterNumber}`);
    }, 500);
  };

  const handleViewHistory = () => {
    setViewHistoryLoading(true);
    setTimeout(() => {
      router.push(`/transactions/${meterNumber}`);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="px-3 py-2"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </span>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Meter Details</h1>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Meter Number:</span>
                <p className="text-gray-900 font-mono">{customer.accountNumber}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Customer Name:</span>
                <p className="text-gray-900">{customer.customerName}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Address:</span>
                <p className="text-gray-900">{customer.address}</p>
              </div>
              
              {customer.meterSerial && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Meter Serial:</span>
                  <p className="text-gray-900 font-mono">{customer.meterSerial}</p>
                </div>
              )}
              
              {customer.tariffDescription && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Tariff:</span>
                  <p className="text-gray-900">{customer.tariffDescription}</p>
                </div>
              )}
              
              {customer.customerType && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Customer Type:</span>
                  <p className="text-gray-900">{customer.customerType}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-amber-800">Outstanding Debt:</span>
                <p className="text-lg font-bold text-amber-900">
                  {formatCurrency(customer.arrearsBalance || customer.accountBalance || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          loading={buyTokenLoading}
          onClick={handleBuyToken}
        >
          Buy Token
        </Button>
        
        <Button 
          variant="secondary" 
          className="w-full" 
          size="lg"
          loading={viewHistoryLoading}
          onClick={handleViewHistory}
        >
          See Receipts and Tokens →
        </Button>
      </div>

      <div className="text-center">
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
