import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Order, OrderStatus, PaymentMethod, ProductItem, User, ReturnType, RefundMethod } from '../types';
import { Save, ArrowLeft, Plus, Trash, MessageCircle, Truck, Link as LinkIcon, IndianRupee, Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

const AdminOrderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([{ name: '', quantity: 1, price: 0 }]);
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PLACED);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PREPAID);
  const [adminNotes, setAdminNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState('');
  const [courierTrackingUrl, setCourierTrackingUrl] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // Return & Refund State
  const [returnDetails, setReturnDetails] = useState<any>(null);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(RefundMethod.ORIGINAL);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = StorageService.getSession();
    setCurrentUser(user);
    if (!user) {
        navigate('/admin/login');
        return;
    }

    if (isEditing && id) {
      const loadOrder = async () => {
        const order = await StorageService.getOrderById(id);
        if (order) {
          setCustomerName(order.customer.fullName);
          setCustomerMobile(order.customer.mobileNumber);
          setCustomerAddress(order.customer.address || '');
          setProducts(order.products);
          setStatus(order.currentStatus);
          setPaymentMethod(order.paymentMethod);
          setAdminNotes(order.adminNotes || '');
          setExpectedDeliveryDate(order.expectedDeliveryDate || '');
          setExpectedDeliveryTime(order.expectedDeliveryTime || '');
          setCourierTrackingUrl(order.courierTrackingUrl || '');
          setAdvanceAmount(order.advanceAmount || 0);
          setReturnDetails(order.returnDetails || null);
          if (order.returnDetails?.refundMethod) setRefundMethod(order.returnDetails.refundMethod);
        }
      };
      loadOrder();
    }
  }, [id, isEditing, navigate]);

  // Permissions Helpers
  const isAdmin = currentUser?.role === 'ADMIN';
  const canEditDetails = isAdmin || currentUser?.permissions?.canEditDetails;
  const canChangeStatus = isAdmin || currentUser?.permissions?.canChangeStatus;
  const canAddAdvance = isAdmin || currentUser?.permissions?.canAddAdvance;
  const canManageReturns = isAdmin || currentUser?.permissions?.canManageReturns;
  const canProcessRefunds = isAdmin || currentUser?.permissions?.canProcessRefunds;

  const handleProductChange = (index: number, field: keyof ProductItem, value: string | number) => {
    if (!canEditDetails) return;
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const addProduct = () => {
    if (!canEditDetails) return;
    setProducts([...products, { name: '', quantity: 1, price: 0 }]);
  };

  const removeProduct = (index: number) => {
    if (!canEditDetails) return;
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const calculateTotal = () => {
    return products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateBalance = () => {
      return Math.max(0, calculateTotal() - advanceAmount);
  };

  const handleWhatsAppUpdate = () => {
    if (!id) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const trackingLink = `${baseUrl}#/order/${id}`;
    let message = `Hello ${customerName},\nOrder *${id}*: *${status}*.\n`;
    
    // Return Context
    if (status === OrderStatus.PICKUP_SCHEDULED && returnDetails?.pickupDate) {
        message += `Return Pickup Scheduled: ${format(new Date(returnDetails.pickupDate), 'dd MMM yyyy')}.\n`;
    } else if (status === OrderStatus.REFUND_COMPLETED) {
        message += `Refund has been processed.\n`;
    } else if (expectedDeliveryDate) {
      const formattedDate = format(new Date(expectedDeliveryDate), 'dd MMM yyyy');
      message += `Expected Delivery: *${formattedDate} ${expectedDeliveryTime}*.\n`;
    }
    
    message += `Track here: ${trackingLink}`;
    let phone = customerMobile.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const now = new Date().toISOString();
    const total = calculateTotal();
    const balance = Math.max(0, total - advanceAmount);

    const orderData: Order = {
      id: isEditing ? id! : `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: { fullName: customerName, mobileNumber: customerMobile, address: customerAddress },
      products,
      totalAmount: total,
      advanceAmount: advanceAmount,
      balanceAmount: balance,
      paymentMethod,
      currentStatus: status,
      adminNotes,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      expectedDeliveryTime: expectedDeliveryTime || undefined,
      courierTrackingUrl: courierTrackingUrl || undefined,
      updatedAt: now,
      createdAt: isEditing ? (await StorageService.getOrderById(id!))!.createdAt : now,
      history: isEditing 
        ? (await StorageService.getOrderById(id!))!.history 
        : [{ status: OrderStatus.PLACED, timestamp: now }]
    };

    // Attach Return Details if exist
    if (returnDetails) {
        orderData.returnDetails = {
            ...returnDetails,
            refundMethod: status === OrderStatus.REFUND_COMPLETED ? refundMethod : undefined
        };
    }

    if (isEditing) {
        const oldOrder = await StorageService.getOrderById(id!);
        if (oldOrder && oldOrder.currentStatus !== status) {
            orderData.history.push({ status: status, timestamp: now });
        }
        await StorageService.updateOrder(orderData);
    } else {
        await StorageService.createOrder(orderData);
    }

    setLoading(false);
    navigate('/admin/dashboard');
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
        </button>
        <div className="flex items-center gap-4">
           {isEditing && (
              <button type="button" onClick={handleWhatsAppUpdate} className="flex items-center text-green-600 hover:text-green-800 font-medium px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Update
              </button>
           )}
           <h1 className="text-2xl font-bold text-gray-900">{isEditing ? `Edit Order ${id}` : 'Create New Order'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 space-y-8">
        
        {/* Customer & Product sections omitted for brevity, logic remains same as previous */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Customer Details</h3>
          <fieldset disabled={!canEditDetails} className="grid grid-cols-1 md:grid-cols-2 gap-6 disabled:opacity-70">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border rounded-lg p-2.5" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label><input type="text" required value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} className="w-full border rounded-lg p-2.5" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} className="w-full border rounded-lg p-2.5" /></div>
          </fieldset>
        </section>

        <section>
          <div className="flex justify-between items-center border-b pb-2 mb-4"><h3 className="text-lg font-semibold text-gray-900">Products & Financials</h3>{canEditDetails && <button type="button" onClick={addProduct} className="text-sm text-blue-600 font-medium flex items-center hover:bg-blue-50 px-2 py-1 rounded"><Plus className="w-4 h-4 mr-1" /> Add Item</button>}</div>
          <fieldset disabled={!canEditDetails} className="space-y-4 disabled:opacity-70">
            {products.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg">
                 <div className="flex-grow"><label className="block text-xs text-gray-500 mb-1">Product Name</label><input type="text" required value={item.name} onChange={e => handleProductChange(index, 'name', e.target.value)} className="w-full border rounded p-2" /></div>
                 <div className="w-24"><label className="block text-xs text-gray-500 mb-1">Qty</label><input type="number" min="1" required value={item.quantity} onChange={e => handleProductChange(index, 'quantity', parseInt(e.target.value))} className="w-full border rounded p-2" /></div>
                 <div className="w-32"><label className="block text-xs text-gray-500 mb-1">Price</label><input type="number" min="0" required value={item.price} onChange={e => handleProductChange(index, 'price', parseFloat(e.target.value))} className="w-full border rounded p-2" /></div>
                 {products.length > 1 && canEditDetails && <button type="button" onClick={() => removeProduct(index)} className="text-red-500 p-2 hover:bg-red-100 rounded"><Trash className="w-4 h-4" /></button>}
              </div>
            ))}
          </fieldset>
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold text-blue-800 uppercase mb-1">Total Amount</label><div className="text-xl font-bold text-blue-900">₹{calculateTotal().toLocaleString()}</div></div>
            <div><label className="block text-xs font-semibold text-blue-800 uppercase mb-1 flex items-center"><IndianRupee className="w-3 h-3 mr-1" /> Advance Paid</label><input type="number" min="0" disabled={!canAddAdvance} value={advanceAmount} onChange={e => setAdvanceAmount(parseFloat(e.target.value) || 0)} className="w-full border-blue-200 rounded p-1.5 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-semibold text-blue-800 uppercase mb-1">Balance Due</label><div className="text-xl font-bold text-red-600">₹{calculateBalance().toLocaleString()}</div></div>
          </div>
        </section>

        {/* Return & Refund Management */}
        {isEditing && returnDetails && (
            <section className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                    <RotateCcw className="w-5 h-5 text-orange-700 mr-2" />
                    <h3 className="text-lg font-bold text-orange-900">Return Management</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-orange-100">
                        <p className="text-sm text-gray-500 mb-1">Request Type</p>
                        <p className="font-bold text-gray-900">{returnDetails.type}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-100">
                        <p className="text-sm text-gray-500 mb-1">Customer Reason</p>
                        <p className="font-bold text-gray-900">{returnDetails.reason}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Status / Action</label>
                        <select 
                            disabled={!canManageReturns}
                            value={status} 
                            onChange={e => setStatus(e.target.value as OrderStatus)} 
                            className="w-full border rounded-lg p-2.5 bg-white font-medium"
                        >
                             <option value={OrderStatus.RETURN_REQUESTED}>Return Requested</option>
                             <option value={OrderStatus.RETURN_APPROVED}>Approve Return</option>
                             <option value={OrderStatus.RETURN_REJECTED}>Reject Return</option>
                             <option value={OrderStatus.PICKUP_SCHEDULED}>Schedule Pickup</option>
                             <option value={OrderStatus.RETURNED}>Item Returned (In Warehouse)</option>
                             {returnDetails.type === ReturnType.REFUND && (
                                <>
                                    <option value={OrderStatus.REFUND_INITIATED}>Initiate Refund</option>
                                    <option value={OrderStatus.REFUND_COMPLETED}>Refund Completed</option>
                                </>
                             )}
                        </select>
                    </div>
                    
                    {/* Pickup Details */}
                    {(status === OrderStatus.RETURN_APPROVED || status === OrderStatus.PICKUP_SCHEDULED) && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                                <input type="date" disabled={!canManageReturns} value={returnDetails.pickupDate || ''} onChange={e => setReturnDetails({...returnDetails, pickupDate: e.target.value})} className="w-full border rounded-lg p-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                                <input type="time" disabled={!canManageReturns} value={returnDetails.pickupTime || ''} onChange={e => setReturnDetails({...returnDetails, pickupTime: e.target.value})} className="w-full border rounded-lg p-2.5" />
                            </div>
                        </>
                    )}

                    {/* Refund Details */}
                    {(status === OrderStatus.REFUND_INITIATED || status === OrderStatus.REFUND_COMPLETED) && (
                         <div className="md:col-span-2 bg-green-50 p-4 rounded-lg border border-green-200">
                             <h4 className="font-bold text-green-900 mb-3">Refund Processing</h4>
                             <label className="block text-sm font-medium text-green-800 mb-1">Refund Method</label>
                             <select 
                                disabled={!canProcessRefunds}
                                value={refundMethod} 
                                onChange={e => setRefundMethod(e.target.value as RefundMethod)} 
                                className="w-full border rounded-lg p-2.5 bg-white"
                             >
                                 {Object.values(RefundMethod).map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             {!canProcessRefunds && <p className="text-xs text-red-500 mt-2">You do not have permission to process refunds.</p>}
                         </div>
                    )}
                </div>
            </section>
        )}

        {/* Standard Logistics Section */}
        <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Forward Logistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                    <select 
                        disabled={!canChangeStatus || !!returnDetails} // Disable standard status if return active
                        value={status} 
                        onChange={e => setStatus(e.target.value as OrderStatus)} 
                        className="w-full border rounded-lg p-2.5 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    >
                        {Object.values(OrderStatus).filter(s => !s.startsWith('Return') && !s.startsWith('Pickup') && !s.startsWith('Refund')).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label><select disabled={!canEditDetails} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full border rounded-lg p-2.5 bg-white disabled:bg-gray-100">{Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Truck className="w-3 h-3 mr-1" /> Expected Delivery Date</label><input disabled={!canEditDetails} type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} className="w-full border rounded-lg p-2.5 disabled:bg-gray-100" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Expected Delivery Time</label><input disabled={!canEditDetails} type="time" value={expectedDeliveryTime} onChange={e => setExpectedDeliveryTime(e.target.value)} className="w-full border rounded-lg p-2.5 disabled:bg-gray-100" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LinkIcon className="w-3 h-3 mr-1" /> Courier Tracking Link</label><input disabled={!canEditDetails} type="url" placeholder="https://courier.com/track/..." value={courierTrackingUrl} onChange={e => setCourierTrackingUrl(e.target.value)} className="w-full border rounded-lg p-2.5 disabled:bg-gray-100" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Internal Only)</label><textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="w-full border rounded-lg p-2.5" placeholder="Private notes..." /></div>
            </div>
        </section>

        <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Order'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default AdminOrderForm;