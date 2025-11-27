import React, { useState } from 'react';
import { User } from '../types';
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  setUsers: (users: User[]) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers }) => {
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'waiter'>('waiter');
  const [error, setError] = useState('');

  const handleAddUser = () => {
      if (!newName || newPin.length !== 4) {
          setError('נא להזין שם וקוד בן 4 ספרות');
          return;
      }
      
      if (users.some(u => u.pin === newPin)) {
          setError('קוד זה כבר קיים במערכת');
          return;
      }

      const newUser: User = {
          id: `u_${Date.now()}`,
          name: newName,
          pin: newPin,
          role: newRole,
          isActive: true
      };

      setUsers([...users, newUser]);
      setNewName('');
      setNewPin('');
      setError('');
  };

  const handleDeleteUser = (id: string) => {
      if (window.confirm('האם למחוק משתמש זה?')) {
          setUsers(users.filter(u => u.id !== id));
      }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
        <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <UserIcon /> ניהול צוות
        </h3>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <h4 className="font-bold text-sm mb-3 text-gray-700">הוספת עובד חדש</h4>
            <div className="flex gap-3 mb-3">
                <input 
                    type="text" 
                    placeholder="שם העובד" 
                    className="flex-1 p-2 border rounded-lg text-sm"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="קוד (4 ספרות)" 
                    maxLength={4}
                    className="w-24 p-2 border rounded-lg text-sm text-center font-mono"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g,''))}
                />
                <select 
                    className="p-2 border rounded-lg text-sm"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                >
                    <option value="waiter">מלצר</option>
                    <option value="admin">מנהל</option>
                </select>
            </div>
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            <button 
                onClick={handleAddUser}
                className="w-full bg-secondary text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800 flex items-center justify-center gap-2"
            >
                <Plus size={16} /> הוסף למערכת
            </button>
        </div>

        <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 sticky top-0">
                    <tr>
                        <th className="p-3 text-right rounded-r-lg">שם</th>
                        <th className="p-3 text-right">תפקיד</th>
                        <th className="p-3 text-center">קוד</th>
                        <th className="p-3 rounded-l-lg"></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="p-3 font-medium">{user.name}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {user.role === 'admin' ? 'מנהל' : 'מלצר'}
                                </span>
                            </td>
                            <td className="p-3 text-center font-mono text-gray-500">****</td>
                            <td className="p-3 text-center">
                                {user.id !== 'u1' && ( // Prevent deleting master admin
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};