import React from 'react';

interface FooterProps {
  showWhatsApp?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showWhatsApp = false }) => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        {showWhatsApp && (
          <div className="text-center">
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
        )}
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <a
              href="https://tellerpoint.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006BD5] hover:text-[#0056A3]"
            >
              Tellerpoint
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
