import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">
            IKEDC Prepaid
          </div>
        </Link>
      </div>
    </header>
  );
};
