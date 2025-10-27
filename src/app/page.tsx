'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validateForm } from '@/lib/validators';
import { useToast } from '@/components/ui/Toast';

export default function Home() {
  const [meterNumber, setMeterNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <div className="h-full flex flex-col justify-center">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Enter Meter Number"
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
            loading={isLoading}
          >
            Next
          </Button>
        </form>
      </Card>
    </div>
  );
}
