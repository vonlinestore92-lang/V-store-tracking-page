import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User, StaffPermissions } from '../types';
import { Plus, Trash2, Edit2, Check, X, Shield, RefreshCw, Key } from 'lucide-react';

const initialPermissions: StaffPermissions = {
  canAddOrders: true,
  canEditDetails: true,
  canAddAdvance: true,
  canChangeStatus: false,
  canManageReturns: false,
  canProcessRefunds: false,
};

const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<StaffPermissions>(initialPermissions);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    const data = await StorageService.getStaff();
    setStaffList(data);
  };

  const handleEdit = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || '');
    setPermissions(user.permissions || initialPermissions);
    setEditingId(user.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
        await StorageService.deleteStaff(id);
        loadStaff();
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPermissions(initialPermissions);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !password) {
        alert("Password is required for new staff");
        return;
    }

    const newUser: User = {
        id: editingId || `STAFF_${Date.now()}`,
        name,
        email,
        password: password, // Store password
        role: 'STAFF',
        isActive: true,
        permissions
    };
    await StorageService.saveStaff(newUser);
    loadStaff();
    resetForm();
  };

  const togglePermission = (key: keyof StaffPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-500">Configure roles, credentials, and access permissions.</p>
        </div>
        {!isFormOpen && (
            <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
                <Plus className="w-4 h-4 mr-2" /> Add Staff
            </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingId ? 'Edit Staff' : 'Add New Staff'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input 
                                required={!editingId} 
                                type="text" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500"
                                placeholder={editingId ? "Leave empty to keep same" : "Set password"}
                            />
                            <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" /> General Permissions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input type="checkbox" checked={permissions.canAddOrders} onChange={() => togglePermission('canAddOrders')} className="rounded text-blue-900 focus:ring-blue-900" />
                            <span className="text-sm text-gray-700">Can Create Orders</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input type="checkbox" checked={permissions.canEditDetails} onChange={() => togglePermission('canEditDetails')} className="rounded text-blue-900 focus:ring-blue-900" />
                            <span className="text-sm text-gray-700">Can Edit Customer Details</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input type="checkbox" checked={permissions.canAddAdvance} onChange={() => togglePermission('canAddAdvance')} className="rounded text-blue-900 focus:ring-blue-900" />
                            <span className="text-sm text-gray-700">Can Add Payments</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input type="checkbox" checked={permissions.canChangeStatus} onChange={() => togglePermission('canChangeStatus')} className="rounded text-blue-900 focus:ring-blue-900" />
                            <span className="text-sm text-gray-700">Can Change Order Status</span>
                        </label>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center border-t border-gray-200 pt-3">
                        <RefreshCw className="w-4 h-4 mr-2" /> Return & Refund Permissions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input type="checkbox" checked={permissions.canManageReturns} onChange={() => togglePermission('canManageReturns')} className="rounded text-blue-900 focus:ring-blue-900" />
                            <span className="text-sm text-gray-700">Can Manage Returns (Approve/Reject)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input type="checkbox" checked={permissions.canProcessRefunds} onChange={() => togglePermission('canProcessRefunds')} className="rounded text-blue-900 focus:ring-blue-900" />
                            <span className="text-sm text-gray-700">Can Process Refunds (Sensitive)</span>
                        </label>
                    </div>

                    <p className="text-xs text-red-500 mt-4">* Staff cannot delete orders or manage other staff.</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 shadow-sm">Save Staff</button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {staffList.map(staff => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{staff.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{staff.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                            {staff.password ? '••••••' : 'Default'}
                        </td>
                        <td className="px-6 py-4">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium flex justify-end space-x-3">
                            <button onClick={() => handleEdit(staff)} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(staff.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;