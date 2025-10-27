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
    <div className="h-full flex flex-col">
      {/* Back Button */}
      <div className="flex items-center mb-2">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-[#006BD5] hover:text-[#0056A3] transition-colors py-1 -ml-2"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="mb-2">
        <h1 className="text-base font-bold text-gray-900 text-center">Meter Details</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <Card>
          <div className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-600">Meter number</span>
                <p className="text-xs font-semibold text-gray-900 text-right">{meterNumber}</p>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-600">Account name</span>
                <p className="text-xs font-semibold text-gray-900 text-right">{customer.customerName.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-600">Account type</span>
                <p className="text-xs font-semibold text-gray-900 text-right">Prepaid</p>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-600">Outstanding balance</span>
                  <p className="text-xs font-semibold text-gray-900 text-right">{formatCurrency(customer.arrearsBalance || customer.accountBalance || 0)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-600">Minimum vend amount</span>
                <p className="text-xs font-semibold text-gray-900 text-right">{formatCurrency(1000)}</p>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-600 flex-shrink-0 mr-2">Address</span>
                <p className="text-xs font-semibold text-gray-900 text-right break-words">{customer.address.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
              </div>
              
              {customer.meterSerial && (
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-600">Feeder name</span>
                  <p className="text-xs font-semibold text-gray-900 text-right">{customer.meterSerial.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                </div>
              )}
              
              {customer.tariffDescription && (
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-600">Tariff</span>
                  <p className="text-xs font-semibold text-gray-900 text-right">{customer.tariffDescription.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-1 mt-1">
        <Button 
          className="w-full" 
          size="sm"
          loading={buyTokenLoading}
          onClick={handleBuyToken}
        >
          Buy Token
        </Button>
        
        <Button 
          variant="secondary" 
          className="w-full" 
          size="sm"
          loading={viewHistoryLoading}
          onClick={handleViewHistory}
        >
          Transaction History
        </Button>
      </div>

      <div className="text-center mt-1">
        <p className="text-xs text-gray-600 mb-1">Need help?</p>
        <a
          href="https://wa.me/2348089932753"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-600 hover:text-green-700 font-medium"
        >
          WhatsApp: 08089932753
        </a>
      </div>
    </div>
  );
}
