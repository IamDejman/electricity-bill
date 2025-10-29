'use client';

import { ReactNode } from 'react';

interface NoScrollScreenProps {
  children: ReactNode;
  className?: string;
}

export default function NoScrollScreen({ 
  children, 
  className = "" 
}: NoScrollScreenProps) {
  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  );
}
