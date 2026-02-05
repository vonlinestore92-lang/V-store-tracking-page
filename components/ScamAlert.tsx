import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ScamAlert: React.FC = () => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-fade-in my-6 text-left">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">
            BE AWARE OF SCAMS
          </h3>
          <div className="mt-1 text-sm text-red-700 space-y-1">
            <p>
              Please do not make any extra payments outside of our official website.
            </p>
            <p>
              We communicate <strong>only</strong> via our official helpline numbers, email, and WhatsApp channels. Do not trust messages from unknown sources asking for money.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
