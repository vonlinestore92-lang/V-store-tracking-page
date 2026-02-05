import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order, OrderStatus, ReturnType } from '../types';
import { StorageService } from '../services/storage';
import { RETURN_REASONS } from '../constants';
import { Loader2, ArrowLeft, MapPin, Package, Calendar, ExternalLink, Truck, Share2, RotateCcw, MessageCircle } from 'lucide-react';
import { OrderTimeline } from '../components/OrderTimeline';
import { SupportContact } from '../components/SupportContact';
import { ScamAlert } from '../components/ScamAlert';
import { format } from 'date-fns';

const OrderResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  
  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnType, setReturnType] = useState<ReturnType>(ReturnType.REPLACEMENT);
  const [returnRemarks, setReturnRemarks] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (id) {
        const found = await StorageService.getOrderById(id);
        setOrder(found || null);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const getTrackingUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    // Ensure no double hashes if pathname is empty/root
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // If using hash router, we typically look like /index.html#/order/123
    // window.location.href is usually safest but lets construct it manually to be sure
    return window.location.href; 
  };

  const handleCopyLink = async () => {
    try {
        await navigator.clipboard.writeText(getTrackingUrl());
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
        console.error("Failed to copy", err);
        alert("Failed to copy link. Please copy the URL from browser address bar.");
    }
  };

  const handleWhatsAppShare = () => {
      if (!order) return;
      const text = `Track order status for *${order.customer.fullName}* (Order ID: ${order.id}) at V STORE.\nStatus: ${order.currentStatus}\nLink: ${getTrackingUrl()}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!order) return;
      setSubmittingReturn(true);

      const now = new Date().toISOString();
      const updatedOrder: Order = {
          ...order,
          currentStatus: OrderStatus.RETURN_REQUESTED,
          updatedAt: now,
          history: [...order.history, { status: OrderStatus.RETURN_REQUESTED, timestamp: now }],
          returnDetails: {
              reason: returnReason,
              type: returnType,
              remarks: returnRemarks,
              refundStatus: 'Pending'
          }
      };

      await StorageService.updateOrder(updatedOrder);
      setOrder(updatedOrder);
      setIsReturnModalOpen(false);
      setSubmittingReturn(false);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-8">We couldn't find an order with ID: {id}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium mb-12">&larr; Back to Search</Link>
        <div className="w-full max-w-3xl"><SupportContact /></div>
      </div>
    );
  }

  const canRequestReturn = order.currentStatus === OrderStatus.DELIVERED && !order.returnDetails;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12 relative">
      <div className="flex justify-between items-center">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
        </Link>
        <div className="flex gap-2">
            <button onClick={handleWhatsAppShare} className="flex items-center text-sm text-green-600 hover:text-green-800 font-medium bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
            </button>
            <div className="relative">
                <button onClick={handleCopyLink} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    <Share2 className="w-4 h-4 mr-1" /> Copy Link
                </button>
                {showShareTooltip && (
                    <span className="absolute right-0 top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">Link Copied!</span>
                )}
            </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-6 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Order #{order.id}</h1>
            <p className="text-blue-100 text-sm mt-1">Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-blue-100 text-xs uppercase mb-1 opacity-80">Total Amount</span>
            <span className="text-3xl font-bold text-white">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><Package className="w-5 h-5 mr-2 text-blue-600" /> Tracking Status</h3>
            <OrderTimeline order={order} />
            
            {/* Return Request Button */}
            {canRequestReturn && (
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={() => setIsReturnModalOpen(true)}
                        className="flex items-center px-6 py-3 bg-white border-2 border-blue-900 text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Request Return
                    </button>
                </div>
            )}

            {/* Return Info Box */}
            {order.returnDetails && (
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h4 className="text-orange-900 font-bold flex items-center mb-2">
                        <RotateCcw className="w-4 h-4 mr-2" /> Return {order.returnDetails.type} Requested
                    </h4>
                    <p className="text-sm text-gray-700 mb-1"><strong>Reason:</strong> {order.returnDetails.reason}</p>
                    {order.returnDetails.pickupDate && (
                        <p className="text-sm text-gray-700">
                            <strong>Pickup Scheduled:</strong> {format(new Date(order.returnDetails.pickupDate), 'MMM dd, yyyy')}
                            {order.returnDetails.pickupTime && ` at ${order.returnDetails.pickupTime}`}
                        </p>
                    )}
                </div>
            )}
          </div>

          {(order.expectedDeliveryDate || order.courierTrackingUrl) && (
            <div className="mb-8 p-5 bg-blue-50 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                {order.expectedDeliveryDate && (
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="bg-blue-100 p-2 rounded-full mr-3"><Truck className="w-5 h-5 text-blue-700" /></div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase">Expected Delivery</p>
                      <p className="text-lg font-bold text-gray-900">
                        {format(new Date(order.expectedDeliveryDate), 'EEE, MMM dd')}
                        {order.expectedDeliveryTime && <span className="text-base font-normal ml-1">at {order.expectedDeliveryTime}</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {order.courierTrackingUrl && (
                <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm w-full sm:w-auto justify-center">
                  Track on Courier Website <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                <div className="bg-gray-50 p-5 rounded-xl space-y-3 border border-gray-100">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-medium text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    {order.advanceAmount !== undefined && order.advanceAmount > 0 && (
                        <div className="flex justify-between text-green-700">
                            <span>Advance Paid</span>
                            <span className="font-medium">- ₹{order.advanceAmount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
                        <span className="font-bold text-gray-800">Balance to Pay</span>
                        <span className="font-bold text-red-600 text-lg">₹{(order.balanceAmount ?? order.totalAmount).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-600" /> Customer Details</h3>
              <div className="bg-white border rounded-xl p-4 space-y-2 mb-4">
                <p className="font-medium text-gray-900">{order.customer.fullName}</p>
                <p className="text-gray-500 font-medium">{order.customer.mobileNumber}</p>
                {order.customer.address && <p className="text-gray-500 text-sm">{order.customer.address}</p>}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Items</h3>
              <ul className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
                  {order.products.map((p, i) => (
                      <li key={i} className="p-3 bg-white flex justify-between items-center">
                          <span className="text-gray-800 font-medium">{p.name}</span>
                          <span className="text-gray-500 text-sm bg-gray-100 px-2 py-0.5 rounded-full">Qty: {p.quantity}</span>
                      </li>
                  ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center text-sm text-gray-500">
             <Calendar className="w-4 h-4 mr-2" /> Last Updated: {format(new Date(order.updatedAt), 'PP pp')}
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {isReturnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Request Return</h3>
                  <form onSubmit={handleReturnSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Why are you returning this?</label>
                          <select required className="w-full border rounded-lg p-2.5 bg-white" value={returnReason} onChange={e => setReturnReason(e.target.value)}>
                              {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">What would you prefer?</label>
                          <div className="grid grid-cols-2 gap-3">
                              <label className={`border rounded-lg p-3 text-center cursor-pointer ${returnType === ReturnType.REPLACEMENT ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                                  <input type="radio" name="rtype" className="hidden" value={ReturnType.REPLACEMENT} checked={returnType === ReturnType.REPLACEMENT} onChange={() => setReturnType(ReturnType.REPLACEMENT)} />
                                  Replacement
                              </label>
                              <label className={`border rounded-lg p-3 text-center cursor-pointer ${returnType === ReturnType.REFUND ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                                  <input type="radio" name="rtype" className="hidden" value={ReturnType.REFUND} checked={returnType === ReturnType.REFUND} onChange={() => setReturnType(ReturnType.REFUND)} />
                                  Refund
                              </label>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Remarks (Optional)</label>
                          <textarea className="w-full border rounded-lg p-2.5" rows={3} value={returnRemarks} onChange={e => setReturnRemarks(e.target.value)} placeholder="Please describe the issue..." />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                          <button type="button" onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                          <button type="submit" disabled={submittingReturn} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
                              {submittingReturn ? 'Submitting...' : 'Submit Request'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Services Section */}
      <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Explore V STORE Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="https://promail.vstoreonline.in/" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="mb-3 text-indigo-100 font-semibold text-xs tracking-wider uppercase">ProMail</div>
                  <h4 className="font-bold text-lg mb-2 leading-tight">GET YOUR PROFESSIONAL BUSINESS EMAIL AT LOWEST COST</h4>
                  <div className="mt-4 inline-flex items-center text-xs font-semibold bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                      Learn More <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
              </a>
              <a href="https://linkin-biovstore.odoo.com/" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="mb-3 text-orange-100 font-semibold text-xs tracking-wider uppercase">Limited Deals</div>
                  <h4 className="font-bold text-2xl mb-2">LIMITED OFFERS</h4>
                  <p className="text-orange-100 text-sm mb-4">Grab exclusive offers now!</p>
                  <div className="inline-flex items-center text-xs font-semibold bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                      Shop Now <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
              </a>
              <a href="https://ebooks.vstoreonline.in/" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="mb-3 text-emerald-100 font-semibold text-xs tracking-wider uppercase">E-Books</div>
                  <h4 className="font-bold text-lg mb-2 leading-tight">MOST POPULAR – V STORE DEBUT E BOOK AT JUST ₹99</h4>
                  <div className="mt-4 inline-flex items-center text-xs font-semibold bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                      Buy Now <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
              </a>
          </div>
      </div>
      
      <ScamAlert />

      <SupportContact />
    </div>
  );
};

export default OrderResultPage;