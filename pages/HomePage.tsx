import React, { useState } from 'react';
import { Search, Loader2, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { format } from 'date-fns';
import { SupportContact } from '../components/SupportContact';
import { ScamAlert } from '../components/ScamAlert';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter an Order ID, Mobile Number, or Name');
      return;
    }

    setIsLoading(true);
    setError('');
    setSearchResults(null);

    try {
      const results = await StorageService.searchOrders(searchTerm);
      if (results.length === 0) {
        setError('No such order found. Please contact support.');
      } else if (results.length === 1) {
        // Exact match, go directly to details
        navigate(`/order/${results[0].id}`);
      } else {
        // Multiple matches, show list
        setSearchResults(results);
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      
      <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-800 text-sm font-bold animate-fade-in shadow-sm">
         <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
         OFFICIAL V STORE ORDERS TRACKING PAGE
      </div>

      <div className="w-full max-w-lg text-center space-y-8 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Enter your Order ID, Mobile Number, or Full Name to get real-time status updates.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., ORD-1001, 9876543210, John Doe"
              className="block w-full rounded-full border-gray-300 pl-6 pr-14 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg sm:text-lg border"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Search className="h-6 w-6" />
              )}
            </button>
          </div>
          {error && <p className="mt-4 text-red-600 text-sm font-bold animate-pulse">{error}</p>}
        </form>

        {/* Multiple Results List */}
        {searchResults && (
          <div className="mt-8 text-left bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">Found {searchResults.length} Orders</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {searchResults.map((order) => (
                <li 
                  key={order.id} 
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center group"
                >
                  <div>
                    <p className="font-bold text-blue-900 group-hover:text-blue-700">{order.id}</p>
                    <p className="text-sm text-gray-500">{format(new Date(order.createdAt), 'MMM dd, yyyy')} • {order.customer.fullName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={order.currentStatus} />
                    <span className="text-xs text-gray-400">View Details &rarr;</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ScamAlert />
      </div>

      {/* Show Contact Support if Order Not Found */}
      {error && <div className="w-full max-w-3xl"><SupportContact /></div>}
    </div>
  );
};

export default HomePage;