import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        attemptLogin(newPin);
      }
    }
  };

  const attemptLogin = (code: string) => {
    const user = users.find(u => u.pin === code && u.isActive);
    if (user) {
      onLogin(user);
    } else {
      setError('קוד שגוי, נסה שנית');
      setTimeout(() => {
          setPin('');
          setError('');
      }, 1000);
    }
  };

  const handleClear = () => {
      setPin('');
      setError('');
  };

  const handleDelete = () => {
      setPin(prev => prev.slice(0, -1));
      setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-primary p-8 text-center text-white">
             <h1 className="text-3xl font-bold mb-2">AyalaTouch</h1>
             <p className="opacity-80">הזדהות למערכת</p>
          </div>
          
          <div className="p-8">
             <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-4 rounded-full">
                   <Lock className="text-secondary" size={32} />
                </div>
             </div>

             <div className="mb-8 text-center h-12">
                {error ? (
                    <p className="text-red-500 font-bold animate-pulse">{error}</p>
                ) : (
                    <div className="flex justify-center gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`w-4 h-4 rounded-full border-2 border-gray-300 ${i < pin.length ? 'bg-primary border-primary' : ''}`}></div>
                        ))}
                    </div>
                )}
             </div>

             <div className="grid grid-cols-3 gap-4 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className="h-16 rounded-xl bg-gray-50 text-xl font-bold text-gray-700 hover:bg-gray-200 active:scale-95 transition-all shadow-sm border border-gray-200"
                    >
                        {num}
                    </button>
                ))}
                <button 
                    onClick={handleClear}
                    className="h-16 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center"
                >
                    C
                </button>
                <button 
                    onClick={() => handleNumberClick('0')}
                    className="h-16 rounded-xl bg-gray-50 text-xl font-bold text-gray-700 hover:bg-gray-200 active:scale-95 transition-all shadow-sm border border-gray-200"
                >
                    0
                </button>
                 <button 
                    onClick={handleDelete}
                    className="h-16 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
                >
                    ⌫
                </button>
             </div>
          </div>
          
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
             מספר עמדה: POS-01
          </div>
       </div>
    </div>
  );
};