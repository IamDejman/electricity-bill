'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCustomerByMeterNumber, getTransactionsForMeter } from '@/lib/mockData';
import { formatCurrency, formatDate, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Transaction } from '@/lib/mockData';
import jsPDF from 'jspdf';

export default function TransactionHistoryPage() {
  const [customerData, setCustomerData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const meterNumber = params.meterNumber as string;
  const { showToast } = useToast();

  useEffect(() => {
    const customer = getCustomerByMeterNumber(meterNumber);
    if (customer) {
      setCustomerData(customer);
      // Get transactions from localStorage first, fallback to mock data
      const storedTransactions = JSON.parse(localStorage.getItem(`transactions_${meterNumber}`) || '[]');
      const mockTransactions = getTransactionsForMeter(meterNumber);
      const allTransactions = storedTransactions.length > 0 ? storedTransactions : mockTransactions;
      setTransactions(allTransactions);
    }
    setIsLoading(false);
  }, [meterNumber]);

  const handleCopyToken = async (token: string) => {
    const success = await copyToClipboard(token);
    if (success) {
      showToast('Token copied!');
    }
  };

  const generateReceiptPDF = (transaction: Transaction) => {
    const doc = new jsPDF();
    
    // Set up the document
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ELECTRICITY PAYMENT RECEIPT', 105, 20, { align: 'center' });
    
    // Add company info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('IKEDC - Ikeja Electric Distribution Company', 105, 30, { align: 'center' });
    doc.text('Payment Receipt', 105, 35, { align: 'center' });
    
    // Add line separator
    doc.line(20, 45, 190, 45);
    
    // Customer details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', 20, 55);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer Name: ${customerData.customer.customerName}`, 20, 65);
    doc.text(`Meter Number: ${meterNumber}`, 20, 72);
    doc.text(`Account Number: ${customerData.customer.accountNumber}`, 20, 79);
    doc.text(`Address: ${customerData.customer.address}`, 20, 86);
    
    // Transaction details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details:', 20, 100);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Transaction ID: ${transaction.id}`, 20, 110);
    doc.text(`Date: ${formatDate(transaction.date)}`, 20, 117);
    doc.text(`Amount: ${formatCurrency(transaction.amount)}`, 20, 124);
    doc.text(`Status: ${transaction.status.toUpperCase()}`, 20, 131);
    
    // Token details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Token Details:', 20, 145);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Token: ${transaction.token}`, 20, 155);
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Thank you for your payment!', 105, 180, { align: 'center' });
    doc.text('For support, contact: 08089932753', 105, 185, { align: 'center' });
    
    // Save the PDF
    const fileName = `receipt_${transaction.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showToast('Receipt downloaded successfully!');
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

  return (
    <div className="h-full flex flex-col">
      {/* Back Button */}
      <div className="flex items-center mb-3">
        <button 
          onClick={() => router.push(`/meter/${meterNumber}`)}
          className="flex items-center text-[#006BD5] hover:text-[#0056A3] transition-colors py-2 -ml-2"
        >
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base font-medium">Back</span>
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Transaction History</h1>
        <p className="text-gray-600 text-sm">Meter: {meterNumber}</p>
        <p className="text-gray-600 text-sm">Customer: {customerData.customer.customerName}</p>
      </div>

      <div className="flex-1 overflow-hidden">
        {transactions.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-4">Make a payment to get your token.</p>
              <Link href={`/payment/${meterNumber}`}>
                <Button>Make Payment</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="h-full overflow-y-auto space-y-3 pr-2">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Token:</span>
                        <p className="text-gray-900 font-mono text-sm">
                          {transaction.token}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateReceiptPDF(transaction)}
                        >
                          Copy Receipt
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopyToken(transaction.token)}
                        >
                          Copy Token
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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
