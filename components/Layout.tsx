import React from 'react';
import { ShoppingBag, ShieldCheck, LogOut, LayoutDashboard, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith('/admin');
  const user = StorageService.getSession();

  const handleLogout = () => {
    StorageService.clearSession();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-900 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              V STORE
            </span>
          </Link>

          <nav className="flex items-center space-x-4">
            {!user && (
               <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-blue-900 flex items-center gap-1">
                 <ShieldCheck className="w-4 h-4" />
                 <span className="hidden sm:inline">Staff Login</span>
               </Link>
            )}
            
            {user && isAdminPath && (
              <div className="flex items-center gap-4">
                 <Link to="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-900 flex items-center gap-1">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Orders</span>
                 </Link>
                 
                 {user.role === 'ADMIN' && (
                    <Link to="/admin/staff" className="text-sm font-medium text-gray-600 hover:text-blue-900 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Staff</span>
                    </Link>
                 )}

                 <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} V STORE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;