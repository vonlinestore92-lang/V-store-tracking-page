import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Order, OrderStatus, User } from '../types';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(StorageService.getSession());
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await StorageService.getOrders();
    setOrders(data);
    setFilteredOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    let result = orders;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.mobileNumber.includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.currentStatus === statusFilter);
    }
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete order ${id}?`)) {
        await StorageService.deleteOrder(id);
        fetchOrders();
    }
  };

  const handleWhatsAppUpdate = (order: Order) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const trackingLink = `${baseUrl}#/order/${order.id}`;
    let message = `Hello ${order.customer.fullName},\nYour order *${order.id}* from V STORE is currently *${order.currentStatus}*.\n`;
    if (order.expectedDeliveryDate) {
      const formattedDate = format(new Date(order.expectedDeliveryDate), 'dd MMM yyyy');
      const time = order.expectedDeliveryTime ? ` ${order.expectedDeliveryTime}` : '';
      message += `Expected Delivery: *${formattedDate}${time}*.\n`;
    }
    message += `Track here: ${trackingLink}`;
    
    let phone = order.customer.mobileNumber.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Staff cannot delete
  const canDelete = currentUser?.role === 'ADMIN';
  const canCreate = currentUser?.role === 'ADMIN' || currentUser?.permissions?.canAddOrders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500">
             Logged in as: <span className="font-semibold">{currentUser?.name}</span> ({currentUser?.role})
          </p>
        </div>
        {canCreate && (
            <Link 
            to="/admin/orders/new"
            className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
            >
            <Plus className="w-4 h-4 mr-2" />
            Create Order
            </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by Order ID, Name, or Mobile..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      <Link to={`/admin/orders/${order.id}`} className="hover:underline">{order.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer.fullName}</div>
                      <div className="text-sm text-gray-500">{order.customer.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       {order.balanceAmount && order.balanceAmount > 0 ? (
                           <span className="text-red-600 font-bold">₹{order.balanceAmount}</span>
                       ) : (
                           <span className="text-green-600 font-medium">Paid</span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.currentStatus} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.updatedAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleWhatsAppUpdate(order)} className="text-green-600 hover:text-green-800"><MessageCircle className="w-4 h-4" /></button>
                        <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></Link>
                        {canDelete && (
                            <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;