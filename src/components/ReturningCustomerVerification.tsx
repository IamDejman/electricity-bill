'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validateEmail, validatePhoneNumber } from '@/lib/validators';
import { useToast } from '@/components/ui/Toast';

interface ReturningCustomerVerificationProps {
  meterNumber: string;
  onVerified: (data: { email: string; phone: string }) => void;
  onCancel: () => void;
}

export default function ReturningCustomerVerification({
  meterNumber,
  onVerified,
  onCancel
}: ReturningCustomerVerificationProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  // Load saved data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('savedEmail');
      const savedPhone = localStorage.getItem('savedPhone');
      
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate inputs
    const emailValidation = validateEmail(email);
    const phoneValidation = validatePhoneNumber(phone);

    if (!emailValidation.isValid || !phoneValidation.isValid) {
      setErrors({
        ...(emailValidation.error && { email: emailValidation.error }),
        ...(phoneValidation.error && { phone: phoneValidation.error })
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call to verify customer
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save updated data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPhone', phone);
      }
      
      showToast('Customer verified successfully!');
      onVerified({ email, phone });
    } catch (error) {
      showToast('Verification failed. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Back Button */}
      <div className="flex items-center mb-3">
        <button 
          onClick={onCancel}
          className="flex items-center text-[#006BD5] hover:text-[#0056A3] transition-colors py-2 -ml-2"
        >
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base font-medium">Back</span>
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Returning Customer</h1>
        <p className="text-gray-600 text-sm text-center">Please verify your contact details for meter: {meterNumber}</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                loading={isLoading}
              >
                Verify & Continue
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={onCancel}
              >
                Cancel
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
