export const validateMeterNumber = (meterNumber: string): { isValid: boolean; error?: string } => {
  if (!meterNumber.trim()) {
    return { isValid: false, error: "Meter number is required" };
  }
  
  const validMeters = ["0102759831", "703829680"];
  if (!validMeters.includes(meterNumber.trim())) {
    return { isValid: false, error: "Meter number not found. Please check and try again." };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { isValid: true }; // Phone is optional
  }
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Nigerian phone number patterns
  const patterns = [
    /^234[0-9]{10}$/, // +234 format
    /^0[0-9]{10}$/,   // 0 format
    /^[0-9]{10}$/     // 10 digits
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleanPhone));
  
  if (!isValid) {
    return { isValid: false, error: "Please enter a valid Nigerian phone number" };
  }
  
  return { isValid: true };
};

export const validateForm = (meterNumber: string, email: string, phone: string) => {
  const meterValidation = validateMeterNumber(meterNumber);
  const emailValidation = validateEmail(email);
  const phoneValidation = validatePhoneNumber(phone);
  
  const errors: Record<string, string> = {};
  
  if (meterValidation.error) errors.meterNumber = meterValidation.error;
  if (emailValidation.error) errors.email = emailValidation.error;
  if (phoneValidation.error) errors.phone = phoneValidation.error;
  
  return {
    isValid: meterValidation.isValid && emailValidation.isValid && phoneValidation.isValid,
    errors
  };
};
