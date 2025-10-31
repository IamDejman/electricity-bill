'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCustomerByMeterNumber } from '@/lib/mockData';
import { formatCurrency, formatDate, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import jsPDF from 'jspdf';

export default function PaymentSuccessPage() {
  const [customerData, setCustomerData] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const meterNumber = params.meterNumber as string;
  const { showToast } = useToast();

  useEffect(() => {
    const customer = getCustomerByMeterNumber(meterNumber);
    if (customer) {
      setCustomerData(customer);
      
      // Get the latest transaction from localStorage
      const storedTransactions = JSON.parse(localStorage.getItem(`transactions_${meterNumber}`) || '[]');
      if (storedTransactions.length > 0) {
        const override = searchParams.get('status');
        const latest = storedTransactions[0];
        if (override === 'pending' || override === 'failed' || override === 'success') {
          setTransaction({ ...latest, status: override });
        } else {
          setTransaction(latest); // Most recent transaction
        }
      }
    }
    setIsLoading(false);
  }, [meterNumber]);

  const handleCopyToken = async () => {
    if (!transaction) return;
    const success = await copyToClipboard(transaction.token);
    if (success) {
      showToast('Token copied!');
    }
  };

  const generateReceiptPDF = () => {
    if (!transaction || !customerData) return;
    
    const doc = new jsPDF();
    
    // Enhanced receipt design based on IKEDC data structure with IE colors
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(192, 52, 56); // #c03438
    doc.text('IKEDC PREPAID ELECTRICITY RECEIPT', 105, 20, { align: 'center' });
    
    // Company header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('IKEJA ELECTRIC DISTRIBUTION COMPANY', 105, 30, { align: 'center' });
    doc.text('Prepaid Electricity Token Receipt', 105, 37, { align: 'center' });
    
    // Decorative line
    doc.setDrawColor(192, 52, 56); // #c03438
    doc.setLineWidth(1.5);
    doc.line(20, 45, 190, 45);
    
    // Receipt number and date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt No: ${transaction.id}`, 20, 55);
    doc.text(`Date: ${formatDate(transaction.date)}`, 150, 55);
    
    // Customer Information Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CUSTOMER INFORMATION', 20, 70);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer Name: ${customerData.customer.customerName}`, 20, 80);
    doc.text(`Meter Number: ${meterNumber}`, 20, 87);
    doc.text(`Account Number: ${customerData.customer.accountNumber}`, 20, 94);
    doc.text(`Address: ${customerData.customer.address}`, 20, 101);
    doc.text(`Tariff: A-Non MD`, 20, 108);
    
    // Transaction Details Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION DETAILS', 20, 125);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Transaction ID: ${transaction.id}`, 20, 135);
    doc.text(`Payment Reference: PB-${transaction.id.slice(-8)}`, 20, 142);
    doc.text(`Vend Status: CONFIRMED`, 20, 149);
    doc.text(`Narration: Vending Successful`, 20, 156);
    doc.text(`Status Code: 00`, 20, 163);
    
    // Amount and Units Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT SUMMARY', 20, 180);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Amount Paid: ${formatCurrency(transaction.amount)}`, 20, 190);
    doc.text(`Units Purchased: ${(transaction.amount / 1000).toFixed(2)} Kwh`, 20, 197);
    doc.text(`Tax (7.5%): ${formatCurrency(transaction.amount * 0.075)}`, 20, 204);
    doc.text(`Convenience Fee: ${formatCurrency(0)}`, 20, 211);
    
    // Token Section with highlight
    doc.setFillColor(244, 180, 49); // #f4b431
    doc.rect(15, 220, 180, 30, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 52, 53); // #373435
    doc.text('ELECTRICITY TOKEN', 20, 235);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Token: ${transaction.token}`, 20, 245);
    
    // Usage instructions
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Instructions: Enter the 20-digit token into your prepaid meter to activate your electricity credit.', 20, 255);
    
    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 265, 190, 265);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Thank you for choosing IKEDC!', 105, 275, { align: 'center' });
    doc.text('For support: 08089932753 | Email: support@ikedc.com', 105, 280, { align: 'center' });
    doc.text('This is a computer generated receipt', 105, 285, { align: 'center' });
    
    // Save the PDF
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `IKEDC_Receipt_${meterNumber}_${dateStr}.pdf`;
    doc.save(fileName);
    
    showToast('Receipt downloaded successfully!');
  };

  const handleViewHistory = () => {
    router.push(`/transactions/${meterNumber}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!customerData || !transaction) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Transaction Not Found</h1>
        <p className="text-gray-600">Unable to load transaction details.</p>
        <Button onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  // Render different states based on last transaction status
  const status = transaction.status as 'success' | 'pending' | 'failed';

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

      <div className="space-y-2 mb-4">
        {status === 'success' && (
          <h1 className="text-2xl font-bold text-gray-900 text-center">Payment Successful</h1>
        )}
        {status === 'pending' && (
          <h1 className="text-2xl font-bold text-gray-900 text-center">Payment Pending</h1>
        )}
        {status === 'failed' && (
          <h1 className="text-2xl font-bold text-gray-900 text-center">Payment Failed</h1>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Card>
          <div className="space-y-6">
            {/* Header by status */}
            {status === 'success' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful</h2>
              </div>
            )}
            {status === 'pending' && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c03438] mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Awaiting Confirmation</h2>
                <p className="text-gray-600">Your payment is being verified. Please check back shortly.</p>
              </div>
            )}
            {status === 'failed' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600">We couldn't confirm your payment. Please try again.</p>
              </div>
            )}

            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Token:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-900">{status === 'success' ? transaction.token : status === 'pending' ? 'Generating…' : '—'}</span>
                    <button
                      onClick={handleCopyToken}
                      className="p-1 hover:bg-gray-200 rounded"
                      disabled={status !== 'success'}
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Transaction Ref:</span>
                  <span className="text-sm text-gray-900">{transaction.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Transaction Amount:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Number of Units:</span>
                  <span className="text-sm text-gray-900">{(transaction.amount / 1000).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Account Type:</span>
                  <span className="text-sm text-gray-900">Prepaid</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Meter Number:</span>
                  <span className="text-sm text-gray-900">{meterNumber}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Customer Name:</span>
                  <span className="text-sm text-gray-900">{customerData.customer.customerName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Address:</span>
                  <span className="text-sm text-gray-900">{customerData.customer.address}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={generateReceiptPDF}
                className="w-full"
                size="lg"
                style={{backgroundColor: '#c03438'}}
                disabled={status !== 'success'}
              >
                {status === 'success' ? 'Download Receipt' : status === 'pending' ? 'Receipt Unavailable (Pending)' : 'Receipt Unavailable (Failed)'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleViewHistory}
                className="w-full"
                size="lg"
                style={{backgroundColor: '#f4b431', color: '#373435'}}
              >
                Transaction History
              </Button>
              {status === 'failed' && (
                <Button
                  className="w-full"
                  size="lg"
                  style={{backgroundColor: '#c03438'}}
                  onClick={() => router.push(`/payment/${meterNumber}`)}
                >
                  Try Payment Again
                </Button>
              )}
            </div>
          </div>
        </Card>
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

      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">Powered by Tellerpoint</p>
      </div>
    </div>
  );
}
