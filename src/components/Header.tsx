import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/images.webp"
            alt="IKEDC Prepaid Logo"
            width={120}
            height={48}
            className="object-contain"
            priority
          />
        </Link>
      </div>
    </header>
  );
};
