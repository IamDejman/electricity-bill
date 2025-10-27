'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export const ConditionalHeader: React.FC = () => {
  const pathname = usePathname();
  
  // Show header only on the home page
  const showHeader = pathname === '/';
  
  return showHeader ? <Header showLogo={true} /> : null;
};
