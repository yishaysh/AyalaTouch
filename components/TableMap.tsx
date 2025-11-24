import React from 'react';
import { Table, TableStatus } from '../types';
import { User, Clock, DollarSign, Coffee } from 'lucide-react';

interface TableMapProps {
  tables: Table[];
  onTableSelect: (tableId: number) => void;
}

export const TableMap: React.FC<TableMapProps> = ({ tables, onTableSelect }) => {
  
  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case TableStatus.FREE: return 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200';
      case TableStatus.OCCUPIED: return 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200';
      case TableStatus.ORDERED: return 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200';
      case TableStatus.PAYMENT: return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case TableStatus.FREE: return <User className="opacity-50" />;
      case TableStatus.OCCUPIED: return <User />;
      case TableStatus.ORDERED: return <Coffee className="animate-pulse" />;
      case TableStatus.PAYMENT: return <DollarSign className="animate-bounce" />;
    }
  };

  const formatTime = (date?: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    // Ensure valid date before formatting
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-secondary mb-8">מפת שולחנות</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onTableSelect(table.id)}
            className={`
              relative p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 aspect-square
              transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-1
              ${getStatusColor(table.status)}
            `}
          >
            <div className="absolute top-3 left-3 text-sm font-bold opacity-60">
              #{table.id}
            </div>
            
            {table.startTime && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium opacity-70 bg-white/50 px-2 py-1 rounded-full">
                <Clock size={12} />
                {formatTime(table.startTime)}
              </div>
            )}

            <div className="p-4 bg-white/40 rounded-full backdrop-blur-sm">
              {getStatusIcon(table.status)}
            </div>
            
            <div className="text-center">
              <h3 className="font-bold text-lg">{table.name}</h3>
              <p className="text-sm opacity-80">
                {table.status === TableStatus.FREE 
                  ? 'פנוי' 
                  : `${table.guests} אורחים`}
              </p>
            </div>

            {table.status === TableStatus.PAYMENT && (
               <div className="absolute -bottom-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                 מבקשים חשבון
               </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};