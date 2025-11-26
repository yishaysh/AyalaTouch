import React from 'react';
import { Table, TableStatus, OrderItem, PastOrder } from '../types';
import { DollarSign, Users, Clock, Power, TrendingUp, AlertCircle, Play, RotateCcw } from 'lucide-react';

interface AdminDashboardProps {
  tables: Table[];
  onEndShift: () => void;
  onRunSimulation?: () => void; // New prop for demo
  onResetData?: () => void; // New prop for reset
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ tables, onEndShift, onRunSimulation, onResetData }) => {
  // SAFE ACCESS: Ensure tables is an array before reducing
  const safeTables = Array.isArray(tables) ? tables : [];

  // Calculate Stats
  const occupiedTables = safeTables.filter(t => t.status !== TableStatus.FREE).length;
  
  const totalGuests = safeTables.reduce((sum, t) => sum + (t.guests || 0), 0);
  
  // Calculate estimated revenue from current active tables
  const currentRevenue = safeTables.reduce((sum, t) => {
    const orderTotal = (t.currentOrder || []).reduce((orderSum, item) => orderSum + (item.price || 0), 0);
    return sum + orderTotal;
  }, 0);

  // Sum history
  const historicalRevenue = safeTables.reduce((sum, t) => {
     // Guard against missing orderHistory
     const historySum = (t.orderHistory || []).reduce((hSum, order) => hSum + (order.total || 0), 0);
     return sum + historySum;
  }, 0);

  const totalDailyRevenue = currentRevenue + historicalRevenue;

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-3xl font-bold text-secondary">דשבורד ניהול</h2>
            <p className="text-gray-500 mt-1">סקירה בזמן אמת של מסעדת איילה</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="text-left hidden md:block">
                <div className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('he-IL')}</div>
                <div className="text-xs text-gray-500">משמרת בוקר</div>
             </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
              <div className="text-sm text-gray-500 font-medium mb-1">פדיון יומי</div>
              <div className="text-3xl font-bold text-emerald-600">₪{totalDailyRevenue.toLocaleString()}</div>
           </div>
           <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <DollarSign size={24} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
              <div className="text-sm text-gray-500 font-medium mb-1">שולחנות פעילים</div>
              <div className="text-3xl font-bold text-blue-600">{occupiedTables} <span className="text-lg text-gray-400 font-normal">/ {safeTables.length}</span></div>
           </div>
           <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Users size={24} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
              <div className="text-sm text-gray-500 font-medium mb-1">סועדים כרגע</div>
              <div className="text-3xl font-bold text-orange-600">{totalGuests}</div>
           </div>
           <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <Users size={24} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
              <div className="text-sm text-gray-500 font-medium mb-1">הזמנות פתוחות</div>
              <div className="text-3xl font-bold text-purple-600">{safeTables.filter(t => (t.currentOrder || []).length > 0).length}</div>
           </div>
           <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
              <Clock size={24} />
           </div>
        </div>
      </div>

      {/* Demo & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
         
         {/* System Actions */}
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                <Power className="text-red-500" />
                פעולות מערכת
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                סיום משמרת יאפס את כל השולחנות הפעילים, יעביר את כל ההזמנות הפתוחות להיסטוריה ויאפס את נתוני האורחים.
            </p>
            <button 
                onClick={onEndShift}
                className="w-full py-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
                <Power size={20} />
                סיום משמרת ואיפוס שולחנות
            </button>
         </div>

         {/* Demo Controls */}
         {onRunSimulation && (
             <div className="bg-indigo-50 p-8 rounded-2xl shadow-sm border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                    <Play className="text-indigo-600" />
                    סימולציה והדגמה
                </h3>
                <p className="text-indigo-700 mb-6 leading-relaxed text-sm">
                    הפעל מצב הדגמה כדי לאכלס את המערכת בנתוני אמת (שולחנות, הזמנות במטבח, היסטוריה) לצורך הצגה.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={onRunSimulation}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Play size={20} />
                        הפעל הדגמה
                    </button>
                    {onResetData && (
                        <button 
                            onClick={onResetData}
                            className="flex-1 py-4 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} />
                            אפס נתונים
                        </button>
                    )}
                </div>
             </div>
         )}
      </div>

      {/* Alerts List */}
      <div className="bg-gradient-to-br from-secondary to-slate-800 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <TrendingUp size={200} className="absolute -bottom-10 -right-10" />
        </div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle />
            התראות מערכת
        </h3>
        <ul className="space-y-4 relative z-10">
            {safeTables.filter(t => t.status === TableStatus.PAYMENT).map(t => (
                <li key={t.id} className="flex items-center justify-between bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                    <span>{t.name} מבקש חשבון</span>
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded">לטיפול</span>
                </li>
            ))}
            {safeTables.filter(t => t.status === TableStatus.PAYMENT).length === 0 && (
                <p className="text-slate-400 italic">אין התראות חדשות כרגע...</p>
            )}
        </ul>
      </div>
    </div>
  );
};