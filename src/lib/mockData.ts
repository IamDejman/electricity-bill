export interface Customer {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  customerName: string;
  accountNumber: string;
  customerType?: string;
  arrearsBalance?: number;
  accountBalance?: number;
  canVend: boolean;
  address: string;
  phoneNumber?: string | null;
  emailAddress?: string;
  meterSerial?: string;
  tariffDescription?: string;
}

export interface CustomerData {
  billerName: string;
  customer: Customer;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  token: string;
  status: 'success' | 'pending' | 'failed';
  meterNumber: string;
}

export const MOCK_CUSTOMERS: Record<string, CustomerData> = {
  "0102759831": {
    billerName: "IKEDC",
    customer: {
      firstName: "ADEMOLA",
      middleName: "TAOFEEK",
      lastName: "ADE-ODUMBONI",
      customerName: "ADEMOLA TAOFEEK ADE-ODUMBONI",
      accountNumber: "0102759831",
      customerType: "NMD",
      arrearsBalance: 167359.27,
      canVend: true,
      address: "1 BOLA ABIOYE STREET IJABE",
      phoneNumber: "",
      emailAddress: ""
    }
  },
  "703829680": {
    billerName: "IKEDC",
    customer: {
      customerName: "UBOCHI UCHE",
      phoneNumber: null,
      accountNumber: "703829680",
      address: "Blue Shield Crescent Hse Isashi Ojo",
      meterSerial: "45066613287",
      tariffDescription: "Prepaid Residential 1PH - Band B",
      accountBalance: 0.0,
      canVend: true
    }
  }
};

export const generateMockTransactions = (meterNumber: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Generate 3-5 transactions for the last 30 days
  const transactionCount = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < transactionCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const amount = Math.floor(Math.random() * 9000) + 1000; // N1,000 - N10,000
    const token = generateToken();
    
    transactions.push({
      id: `txn_${meterNumber}_${i}`,
      date: date.toISOString(),
      amount,
      token,
      status: 'success',
      meterNumber
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateToken = (): string => {
  const groups = [];
  for (let i = 0; i < 5; i++) {
    const group = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    groups.push(group);
  }
  return groups.join('-');
};

export const getCustomerByMeterNumber = (meterNumber: string): CustomerData | null => {
  return MOCK_CUSTOMERS[meterNumber] || null;
};

export const getTransactionsForMeter = (meterNumber: string): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(`transactions_${meterNumber}`);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const mockTransactions = generateMockTransactions(meterNumber);
  localStorage.setItem(`transactions_${meterNumber}`, JSON.stringify(mockTransactions));
  return mockTransactions;
};

export const addTransaction = (meterNumber: string, amount: number): Transaction => {
  const token = generateToken();
  const transaction: Transaction = {
    id: `txn_${meterNumber}_${Date.now()}`,
    date: new Date().toISOString(),
    amount,
    token,
    status: 'success',
    meterNumber
  };
  
  const existingTransactions = getTransactionsForMeter(meterNumber);
  const updatedTransactions = [transaction, ...existingTransactions];
  localStorage.setItem(`transactions_${meterNumber}`, JSON.stringify(updatedTransactions));
  
  return transaction;
};
