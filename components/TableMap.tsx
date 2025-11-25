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
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary">מפת שולחנות</h2>
        <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm text-gray-500">
           {tables.filter(t => t.status !== TableStatus.FREE).length} פעילים
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onTableSelect(table.id)}
            className={`
              relative p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 md:gap-3 aspect-[1/1] md:aspect-square
              transition-all duration-200 shadow-sm active:scale-95 hover:shadow-md hover:-translate-y-1
              ${getStatusColor(table.status)}
            `}
          >
            <div className="absolute top-2 left-2 md:top-3 md:left-3 text-xs md:text-sm font-bold opacity-60">
              #{table.id}
            </div>
            
            {table.startTime && (
              <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 text-[10px] md:text-xs font-medium opacity-70 bg-white/50 px-2 py-1 rounded-full">
                <Clock size={10} className="md:w-3 md:h-3" />
                {formatTime(table.startTime)}
              </div>
            )}

            <div className="p-3 md:p-4 bg-white/40 rounded-full backdrop-blur-sm">
              {getStatusIcon(table.status)}
            </div>
            
            <div className="text-center">
              <h3 className="font-bold text-base md:text-lg leading-tight">{table.name}</h3>
              <p className="text-xs md:text-sm opacity-80 mt-1">
                {table.status === TableStatus.FREE 
                  ? 'פנוי' 
                  : `${table.guests} אורחים`}
              </p>
            </div>

            {table.status === TableStatus.PAYMENT && (
               <div className="absolute -bottom-2 md:-bottom-3 bg-blue-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg whitespace-nowrap z-10">
                 מבקשים חשבון
               </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};