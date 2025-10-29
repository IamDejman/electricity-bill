'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { getCustomerByMeterNumber } from '@/lib/mockData';
import { validateEmail, validatePhoneNumber } from '@/lib/validators';
import { useToast } from '@/components/ui/Toast';

export default function EnterAmountPage() {
  const [customerData, setCustomerData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const meterNumber = params.meterNumber as string;
  const { showToast } = useToast();

  useEffect(() => {
    const customer = getCustomerByMeterNumber(meterNumber);
    if (customer) {
      setCustomerData(customer);
      
      // Load saved data from localStorage
      if (typeof window !== 'undefined') {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPhone = localStorage.getItem('savedPhone');
        
        if (savedEmail) setEmail(savedEmail);
        if (savedPhone) setPhone(savedPhone);
      }
    }
    setIsPageLoading(false);
  }, [meterNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate inputs
    const amountValue = parseFloat(amount);
    const emailValidation = validateEmail(email);
    const phoneValidation = validatePhoneNumber(phone);

    // Validate amount
    if (!amount || isNaN(amountValue) || amountValue < 1000) {
      setErrors({ amount: 'Minimum amount is ₦1,000' });
      setIsLoading(false);
      return;
    }

    if (!emailValidation.isValid || !phoneValidation.isValid) {
      setErrors({
        ...(emailValidation.error && { email: emailValidation.error }),
        ...(phoneValidation.error && { phone: phoneValidation.error })
      });
      setIsLoading(false);
      return;
    }

    try {
      // Save data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPhone', phone);
        localStorage.setItem('lastAmount', amount);
      }

      // Navigate to payment page
      router.push(`/payment/${meterNumber}?amount=${amountValue}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
    } catch (error) {
      showToast('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900 text-center">Enter Amount</h1>
        <p className="text-gray-600 text-sm text-center">Meter: {meterNumber}</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₦)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₦</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                    min="1000"
                    step="100"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Minimum amount: ₦1,000</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                style={{backgroundColor: '#c03438'}}
                loading={isLoading}
              >
                Buy Token
              </Button>
            </div>
          </form>
        </Card>
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
