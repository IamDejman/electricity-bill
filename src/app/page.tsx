'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validateForm } from '@/lib/validators';
import { useToast } from '@/components/ui/Toast';
import ReturningCustomerVerification from '@/components/ReturningCustomerVerification';

export default function Home() {
  const [meterNumber, setMeterNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showReturningCustomer, setShowReturningCustomer] = useState(false);
  
  const router = useRouter();
  const { showToast } = useToast();

  // Load saved data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMeter = localStorage.getItem('lastMeterNumber');
      const savedEmail = localStorage.getItem('savedEmail');
      const savedPhone = localStorage.getItem('savedPhone');
      
      if (savedMeter) setMeterNumber(savedMeter);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
      
      // Check if this is a returning customer
      if (savedMeter && (savedEmail || savedPhone)) {
        setShowReturningCustomer(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const validation = validateForm(meterNumber, email, phone);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }
    
    setErrors({});
    
    // Save data to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastMeterNumber', meterNumber);
      if (email) localStorage.setItem('savedEmail', email);
      if (phone) localStorage.setItem('savedPhone', phone);
    }
    
    // Navigate to meter details page
    router.push(`/meter/${meterNumber}`);
  };

  const handleReturningCustomerVerified = (data: { email: string; phone: string }) => {
    setEmail(data.email);
    setPhone(data.phone);
    setShowReturningCustomer(false);
    // Navigate to meter details page
    router.push(`/meter/${meterNumber}`);
  };

  const handleReturningCustomerCancel = () => {
    setShowReturningCustomer(false);
  };

  // Show returning customer verification if needed
  if (showReturningCustomer) {
    return (
      <ReturningCustomerVerification
        meterNumber={meterNumber}
        onVerified={handleReturningCustomerVerified}
        onCancel={handleReturningCustomerCancel}
      />
    );
  }

  return (
    <div className="h-full flex flex-col justify-center">
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4" style={{background: 'linear-gradient(135deg, #c03438 0%, #ec292f 100%)'}}>
            <span className="text-white font-bold text-2xl">IE</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IKEJA ELECTRIC</h1>
            <p className="text-sm italic text-gray-600">...Bringing energy to life</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm">Recharge light instantly. No extra charges</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Enter Meter Number *"
            value={meterNumber}
            onChange={(e) => setMeterNumber(e.target.value)}
            error={errors.meterNumber}
            placeholder="e.g., 0102759831"
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            optional
            placeholder="your@email.com"
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            optional
            placeholder="08012345678"
          />
          
          <Button
            type="submit"
            className="w-full"
            style={{backgroundColor: '#c03438'}}
            loading={isLoading}
          >
            Next
          </Button>
        </form>
      </Card>

      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">Powered by Tellerpoint</p>
      </div>
    </div>
  );
}
