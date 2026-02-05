import React from 'react';
import { Phone, MessageCircle, Mail } from 'lucide-react';

export const SupportContact: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-8 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Need Help? Contact Support</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="tel:+918688203712" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-3">
            <Phone className="w-6 h-6 text-blue-700" />
          </div>
          <span className="font-bold text-gray-900">+91 86882 03712</span>
          <span className="text-xs text-gray-500 mt-1">Mon-Sat (10 AM – 7 PM)</span>
        </a>

        <a href="https://wa.me/918688203712" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
          <div className="bg-green-100 p-3 rounded-full mb-3">
            <MessageCircle className="w-6 h-6 text-green-700" />
          </div>
          <span className="font-bold text-gray-900">WhatsApp Support</span>
          <span className="text-xs text-gray-500 mt-1">Quick Resolve 24/7</span>
        </a>

        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-center w-full">
          <div className="bg-purple-100 p-3 rounded-full mb-3">
            <Mail className="w-6 h-6 text-purple-700" />
          </div>
          <div className="flex flex-col space-y-1">
             <a href="mailto:support@vstoreonline.in" className="font-semibold text-gray-900 hover:text-blue-700 text-sm">support@vstoreonline.in</a>
             <a href="mailto:info@vstoreonline.in" className="font-semibold text-gray-900 hover:text-blue-700 text-sm">info@vstoreonline.in</a>
          </div>
        </div>
      </div>
    </div>
  );
};
