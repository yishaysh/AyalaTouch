import React, { useState, useEffect } from 'react';
import { Table, MenuItem, OrderItem } from '../types';
import { ArrowRight, Plus, Minus, Trash2, Send, Receipt, CheckSquare, RefreshCw, Users, Edit2, History, Clock, ChevronDown, Check, X, Search, Flame, ArrowDownToLine, Printer } from 'lucide-react';
import { AIAssistant } from './AIAssistant';
import { printOrderToKitchen, printBill } from '../services/printerService';

interface OrderInterfaceProps {
  table: Table;
  menuItems: MenuItem[];
  categories: string[];
  onClose: () => void;
  onUpdateOrder: (items: OrderItem[]) => void;
  onUpdateGuests: (guests: number) => void;
  onSendOrder: () => void;
  onRequestBill: () => void;
  onPrintBill: () => void;
  onCloseTable: () => void;
  onResetTable: () => void;
}

// ... (Modifier logic remains unchanged) ...
type ModifierOption = { label: string; id: string; price?: number };
type ModifierGroup = { title: string; id: string; type: 'single' | 'multiple'; options: ModifierOption[] };

const getModifiersForItem = (item: MenuItem): ModifierGroup[] => {
    const groups: ModifierGroup[] = [];
    const cat = item.category || "";
    const name = item.name || "";

    // Coffee & Hot Drinks
    if (cat.includes('שתיה חמה') || name.includes('קפה') || name.includes('הפוך') || name.includes('נס')) {
        groups.push({
            title: 'סוג חלב',
            id: 'milk',
            type: 'single',
            options: [
                { label: 'חלב רגיל', id: 'reg' },
                { label: 'חלב דל שומן', id: 'low' },
                { label: 'חלב סויה', id: 'soy' },
                { label: 'חלב שקדים', id: 'almond' },
                { label: 'חלב שיבולת שועל', id: 'oat' },
            ]
        });
        groups.push({
            title: 'העדפות',
            id: 'prefs',
            type: 'multiple',
            options: [
                { label: 'קפה חלש', id: 'weak' },
                { label: 'קפה חזק', id: 'strong' },
                { label: 'רותח', id: 'hot' },
                { label: 'פושר', id: 'warm' },
                { label: 'בלי קצף', id: 'no_foam' },
            ]
        });
    }

    // Breakfast
    if (cat.includes('בוקר')) {
        groups.push({
            title: 'סוג ביצים',
            id: 'eggs',
            type: 'single',
            options: [
                { label: 'עין', id: 'sunny' },
                { label: 'עין הפוכה', id: 'over_easy' },
                { label: 'מקושקשת', id: 'scrambled' },
                { label: 'חביתה', id: 'omelet' },
                { label: 'חביתת ירק', id: 'herbs' },
            ]
        });
        groups.push({
            title: 'סוג לחם',
            id: 'bread',
            type: 'single',
            options: [
                { label: 'לחם דגנים', id: 'grain' },
                { label: 'לחם לבן', id: 'white' },
                { label: 'לחם ללא גלוטן', id: 'gf' },
            ]
        });
        groups.push({
            title: 'שתיה קרה לבחירה',
            id: 'drink',
            type: 'single',
            options: [
                { label: 'תפוזים', id: 'orange' },
                { label: 'לימונדה', id: 'lemon' },
                { label: 'אשכוליות', id: 'grapefruit' },
                { label: 'מים', id: 'water' },
            ]
        });
    }

    // Salads
    if (cat.includes('סלט')) {
        groups.push({
            title: 'שינויים בסלט',
            id: 'salad_mods',
            type: 'multiple',
            options: [
                { label: 'רוטב בצד', id: 'sauce_side' },
                { label: 'בלי בצל', id: 'no_onion' },
                { label: 'בלי פטרוזיליה', id: 'no_parsley' },
                { label: 'בלי אגוזים', id: 'no_nuts' },
                { label: 'בלי גבינה', id: 'no_cheese' },
            ]
        });
        groups.push({
            title: 'לחם בצד',
            id: 'bread',
            type: 'single',
            options: [
                { label: 'לחם דגנים', id: 'grain' },
                { label: 'לחם לבן', id: 'white' },
                { label: 'ללא לחם', id: 'none' },
            ]
        });
    }

    // Sandwiches & Toasts
    if (cat.includes('כריכים') || cat.includes('טוסט')) {
        groups.push({
            title: 'סוג לחם',
            id: 'bread',
            type: 'single',
            options: [
                { label: 'לחם דגנים', id: 'grain' },
                { label: 'לחם לבן', id: 'white' },
                { label: 'ללא גלוטן', id: 'gf' },
            ]
        });
        groups.push({
            title: 'ירקות',
            id: 'veggies',
            type: 'multiple',
            options: [
                { label: 'בלי בצל', id: 'no_onion' },
                { label: 'בלי עגבניה', id: 'no_tomato' },
                { label: 'בלי חסה', id: 'no_lettuce' },
                { label: 'טוסט חזק', id: 'well_done' },
            ]
        });
    }

    // Pasta / Mains
    if (cat.includes('פסטה') || cat.includes('עיקריות') || name.includes('פסטה')) {
         groups.push({
            title: 'סוג פסטה',
            id: 'pasta_type',
            type: 'single',
            options: [
                { label: 'פנה', id: 'penne' },
                { label: 'פוטוצ\'יני', id: 'fettuccine' },
            ]
        });
         groups.push({
            title: 'שינויים',
            id: 'pasta_mods',
            type: 'multiple',
            options: [
                { label: 'בלי פרמז\'ן', id: 'no_parm' },
                { label: 'רוטב בצד', id: 'sauce_side' },
            ]
        });
    }

    // Starters (First courses)
    if (cat.includes('ראשונות') || cat.includes('נשנושים')) {
        groups.push({
            title: 'רטבים',
            id: 'sauces',
            type: 'multiple',
            options: [
                { label: 'טחינה בצד', id: 'tahini' },
                { label: 'חריף בצד', id: 'spicy' },
                { label: 'ללא רוטב', id: 'no_sauce' },
            ]
        });
    }

    // Cold Drinks
    if (cat.includes('שתיה קרה')) {
        groups.push({
            title: 'הגשה',
            id: 'serving',
            type: 'multiple',
            options: [
                { label: 'הרבה קרח', id: 'extra_ice' },
                { label: 'מעט קרח', id: 'little_ice' },
                { label: 'ללא קרח', id: 'no_ice' },
                { label: 'לימון בצד', id: 'lemon_side' },
                { label: 'כוס זכוכית', id: 'glass' },
            ]
        });
    }

    return groups;
}

export const OrderInterface: React.FC<OrderInterfaceProps> = ({ 
  table, 
  menuItems, 
  categories,
  onClose, 
  onUpdateOrder, 
  onUpdateGuests,
  onSendOrder,
  onRequestBill,
  onPrintBill,
  onCloseTable,
  onResetTable
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'menu' | 'history'>('menu');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drag & Drop State
  const [isDraggingOverCart, setIsDraggingOverCart] = useState(false);
  
  // Note Editing State (Post-add)
  const [editingNoteItem, setEditingNoteItem] = useState<OrderItem | null>(null);
  const [noteText, setNoteText] = useState('');

  // Customization State (Pre-add)
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({}); 
  const [customNote, setCustomNote] = useState('');

  // --- SAFE ACCESSORS ---
  const currentOrder = table?.currentOrder || [];
  const orderHistory = table?.orderHistory || [];
  const guestCount = table?.guests || 0;

  // Set initial category when categories load
  useEffect(() => {
    if (categories.length > 0 && (!activeCategory || !categories.includes(activeCategory))) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const filteredItems = searchTerm.trim()
    ? menuItems.filter(item => {
        const term = searchTerm.toLowerCase().trim();
        return (
            item.name.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term) || 
            item.searchTerms?.some(tag => tag.toLowerCase().includes(term)) 
        );
    })
    : menuItems.filter(item => item.category === activeCategory);

  // --- Handlers ---

  const handleItemClick = (item: MenuItem) => {
    setCustomizingItem(item);
    setSelectedModifiers({});
    setCustomNote('');
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
      if (item.isOutOfStock) {
          e.preventDefault();
          return;
      }
      e.dataTransfer.setData('application/json', JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
      setIsDraggingOverCart(true);
  };

  const handleDragLeave = () => {
      setIsDraggingOverCart(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOverCart(false);
      try {
          const data = e.dataTransfer.getData('application/json');
          if (data) {
              const item = JSON.parse(data) as MenuItem;
              handleItemClick(item); 
          }
      } catch (err) {
          console.error('Failed to parse dropped item', err);
      }
  };

  const toggleModifier = (groupId: string, optionId: string, type: 'single' | 'multiple') => {
      setSelectedModifiers(prev => {
          const current = prev[groupId] || [];
          if (type === 'single') {
              return { ...prev, [groupId]: [optionId] };
          } else {
              if (current.includes(optionId)) {
                  return { ...prev, [groupId]: current.filter(id => id !== optionId) };
              } else {
                  return { ...prev, [groupId]: [...current, optionId] };
              }
          }
      });
  };

  const confirmCustomization = () => {
      if (!customizingItem) return;
      
      const modifiers = getModifiersForItem(customizingItem);
      const parts: string[] = [];

      modifiers.forEach(group => {
          const selectedIds = selectedModifiers[group.id] || [];
          selectedIds.forEach(optId => {
              const opt = group.options.find(o => o.id === optId);
              if (opt) parts.push(opt.label);
          });
      });

      if (customNote.trim()) {
          parts.push(customNote.trim());
      }

      const finalNote = parts.join(', ');
      addToOrder(customizingItem, finalNote);
      setCustomizingItem(null);
      setSearchTerm(''); 
  };

  const addToOrder = (item: MenuItem, notes: string = '') => {
    const newItem: OrderItem = { 
        ...item, 
        uniqueId: Math.random().toString(36).substr(2, 9),
        notes: notes,
        isUrgent: false
    };
    onUpdateOrder([...currentOrder, newItem]);
  };

  const toggleUrgent = (uniqueId: string) => {
      onUpdateOrder(currentOrder.map(item => 
        item.uniqueId === uniqueId ? { ...item, isUrgent: !item.isUrgent } : item
      ));
  };

  const removeItem = (uniqueId: string) => {
    onUpdateOrder(currentOrder.filter(i => i.uniqueId !== uniqueId));
  };

  const openNoteModal = (item: OrderItem) => {
      setEditingNoteItem(item);
      setNoteText(item.notes || '');
  };

  const saveNote = () => {
      if (!editingNoteItem) return;
      const updatedOrder = currentOrder.map(item => 
        item.uniqueId === editingNoteItem.uniqueId ? { ...item, notes: noteText } : item
      );
      onUpdateOrder(updatedOrder);
      setEditingNoteItem(null);
      setNoteText('');
  };

  const updateGuests = (delta: number) => {
      const newCount = Math.max(1, (guestCount || 0) + delta);
      onUpdateGuests(newCount);
  };

  const calculateTotal = () => {
    return currentOrder.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSendOrder = async () => {
      onSendOrder();
      const success = await printOrderToKitchen(table, currentOrder);
      if (success) {
          console.log("Printed successfully");
      }
  };

  const handlePrintBill = async () => {
      const success = await printBill(table);
      if (success) {
          console.log("Bill printed successfully");
      }
  };

  // --- UI Components ---

  const renderHistory = () => (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-24 md:pb-6">
      <h3 className="text-xl font-bold mb-6 text-secondary flex items-center gap-2">
        <History /> היסטוריית הזמנות
      </h3>
      {orderHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <History size={48} className="mb-4 opacity-30" />
          <p>אין הזמנות קודמות לשולחן זה</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {orderHistory.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                 <div className="flex items-center gap-2 text-gray-500 text-sm font-mono">
                    <Clock size={14} />
                    <span>{new Date(order.date).toLocaleDateString('he-IL')} {new Date(order.date).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}</span>
                 </div>
                 <div className="font-bold text-lg text-secondary">סה"כ: ₪{order.total}</div>
              </div>
              <div className="space-y-2">
                 {order.items.map((item, idx) => (
                    <div key={`${order.id}_${idx}`} className="flex justify-between text-sm text-gray-700 border-b border-dashed border-gray-100 pb-1 last:border-0">
                        <div className="flex flex-col">
                            <span className="font-medium flex items-center gap-2">
                                {item.name}
                                {item.isUrgent && <span className="bg-red-100 text-red-600 text-[10px] px-1 rounded font-bold">דחוף</span>}
                            </span>
                            {item.notes && <span className="text-xs text-gray-500 pr-2">{item.notes}</span>}
                        </div>
                        <span className="text-gray-400">₪{item.price}</span>
                    </div>
                 ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const CartContent = () => (
    <>
        <div className={`p-4 bg-gradient-to-r from-secondary to-slate-800 text-white border-b font-bold text-lg flex justify-between items-center shadow-md shrink-0 transition-colors duration-300 ${isDraggingOverCart ? 'bg-blue-600' : ''}`}>
           <div className="flex items-center gap-2">
               <span>סיכום הזמנה</span>
           </div>
           <span className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-mono">
               {currentOrder.length} פריטים
           </span>
           <button onClick={() => setShowMobileCart(false)} className="md:hidden p-1 hover:bg-white/20 rounded-full">
               <ChevronDown />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 relative">
          {/* Drag Overlay */}
          {isDraggingOverCart && (
              <div className="absolute inset-0 bg-blue-50/90 z-10 flex flex-col items-center justify-center border-4 border-blue-400 border-dashed m-2 rounded-xl animate-pulse text-blue-600">
                  <ArrowDownToLine size={48} />
                  <span className="font-bold text-lg mt-2">שחרר כאן להוספה</span>
              </div>
          )}

          {currentOrder.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-60">
              <div className="w-20 h-20 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-white">
                  <Plus size={32} />
              </div>
              <p className="font-medium">ההזמנה ריקה</p>
              <p className="text-xs">לחץ או גרור פריטים לכאן</p>
            </div>
          ) : (
            currentOrder.map((item, idx) => (
              <div key={item.uniqueId} className={`bg-white p-3 rounded-xl border shadow-sm animate-in slide-in-from-right-8 duration-300 ${item.isUrgent ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`} style={{animationDelay: `${idx * 50}ms`}}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            {item.name}
                            {item.isUrgent && <Flame size={12} className="text-red-500 fill-red-500" />}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">₪{item.price}</div>
                    </div>
                    <button 
                        onClick={() => removeItem(item.uniqueId)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-gray-100">
                    <button 
                        onClick={() => openNoteModal(item)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${item.notes ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <Edit2 size={12} />
                        {item.notes ? item.notes : 'הערה'}
                    </button>
                    <button 
                        onClick={() => toggleUrgent(item.uniqueId)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${item.isUrgent ? 'bg-red-50 text-red-600 border border-red-200' : 'text-gray-400 hover:bg-gray-100'}`}
                        title="סמן כדחוף למטבח"
                    >
                        <Flame size={12} className={item.isUrgent ? "fill-current" : ""} />
                        {item.isUrgent ? 'דחוף!' : 'דחוף?'}
                    </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t shadow-[0_-8px_30px_rgba(0,0,0,0.05)] z-30 space-y-3 shrink-0 pb-safe">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium">סה"כ לתשלום:</span>
            <span className="text-2xl font-bold text-secondary">₪{calculateTotal()}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
                    onClick={handleSendOrder}
                    disabled={currentOrder.length === 0}
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Send size={20} />
                    <span>שלח למטבח</span>
            </button>
            <button
                onClick={handlePrintBill}
                disabled={currentOrder.length === 0}
                className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 border border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="הדפס חשבון"
            >
                <Printer size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
                onClick={onRequestBill}
                className="flex flex-col items-center justify-center p-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 border border-blue-200 transition-colors text-xs font-bold gap-1"
            >
                <Receipt size={16} />
                חשבון
            </button>

            <button
                onClick={onCloseTable}
                className="flex flex-col items-center justify-center p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-bold gap-1"
            >
                <CheckSquare size={16} />
                סגור
            </button>

            <button
                onClick={onResetTable}
                className="flex flex-col items-center justify-center p-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 border border-red-200 transition-colors text-xs font-bold gap-1"
            >
                <RefreshCw size={16} />
                נקה
            </button>
          </div>
        </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col md:flex-row h-full animate-in slide-in-from-bottom-5 duration-300">
      
      {/* --- Main Area (Menu/History) --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-white p-3 md:p-6 border-b flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                <ArrowRight />
            </button>
            <div>
                <h2 className="text-lg md:text-2xl font-bold text-secondary">{table?.name}</h2>
                <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                        <Users size={14} />
                        <span>{guestCount}</span>
                        <div className="flex gap-1 mr-2 border-r border-gray-300 pr-2">
                            <button onClick={() => updateGuests(1)} className="hover:text-primary font-bold px-1"><Plus size={14} /></button>
                            <button onClick={() => updateGuests(-1)} className="hover:text-primary font-bold px-1"><Minus size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode('menu')}
               className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-bold transition-all ${viewMode === 'menu' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               תפריט
             </button>
             <button 
               onClick={() => setViewMode('history')}
               className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               היסטוריה
             </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'menu' ? (
          <>
            {/* Search Bar (New Feature) */}
            <div className="p-4 pb-0 bg-white">
                <div className="relative">
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="חיפוש מהיר של מנה..." 
                        className="w-full bg-gray-100 border-none rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories (Hidden if searching) */}
            {!searchTerm && (
                <div className="bg-white border-b shadow-sm shrink-0 z-10">
                    <div className="flex overflow-x-auto no-scrollbar p-3 gap-2 md:gap-3 items-center">
                    {categories.map((cat) => (
                        <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                            activeCategory === cat 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        >
                        {cat}
                        </button>
                    ))}
                    </div>
                </div>
            )}

            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-24 md:pb-6">
               <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 content-start">
                    {filteredItems.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
                            <Search size={48} className="mb-2 opacity-20" />
                            <p>{searchTerm ? 'לא נמצאו מנות תואמות' : 'אין פריטים בקטגוריה זו'}</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <button
                            key={item.id}
                            draggable={!item.isOutOfStock}
                            onDragStart={(e) => handleDragStart(e, item)}
                            disabled={item.isOutOfStock}
                            onClick={() => handleItemClick(item)}
                            className={`
                                bg-white p-4 md:p-5 rounded-2xl border shadow-sm text-right flex flex-col justify-between h-full relative overflow-hidden transition-all cursor-grab active:cursor-grabbing
                                ${item.isOutOfStock 
                                    ? 'opacity-60 grayscale border-gray-100 cursor-not-allowed' 
                                    : 'border-gray-100 hover:border-primary/50 hover:shadow-lg active:scale-[0.98]'
                                }
                            `}
                            >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-secondary text-base md:text-lg">{item.name}</div>
                                </div>
                                {item.description && (
                                    <div className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3 pl-2">
                                        {item.description}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-end mt-auto">
                                {item.isOutOfStock ? (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">אזל מהמלאי</span>
                                ) : (
                                    <div className="font-bold text-primary bg-orange-50 px-3 py-1 rounded-lg">
                                        ₪{item.price}
                                    </div>
                                )}
                            </div>
                            </button>
                        ))
                    )}
                    </div>
               </div>
            </div>
            
            {/* Mobile: Floating Cart Summary Button */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-safe z-20">
                <button 
                    onClick={() => setShowMobileCart(true)}
                    className="w-full bg-secondary text-white py-3 px-6 rounded-xl shadow-xl flex items-center justify-between font-bold animate-in slide-in-from-bottom-5"
                >
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                            {currentOrder.length}
                        </div>
                        <span>צפה בעגלה</span>
                    </div>
                    <span>₪{calculateTotal()}</span>
                </button>
            </div>
          </>
        ) : (
          renderHistory()
        )}
      </div>

      {/* --- Desktop: Sidebar Cart / Mobile: Bottom Sheet Cart --- */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
            md:relative md:w-[400px] md:translate-y-0 md:flex md:flex-col md:border-r md:border-gray-200 bg-white shadow-2xl z-40
            fixed inset-0 flex flex-col transition-transform duration-300 ease-in-out
            ${showMobileCart ? 'translate-y-0' : 'translate-y-full'}
            md:h-full
      `}>
         <CartContent />
      </div>

      {/* Item Customization Modal */}
      {customizingItem && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-4 bg-secondary text-white flex justify-between items-center shrink-0">
                      <h3 className="font-bold text-lg">{customizingItem.name}</h3>
                      <button onClick={() => setCustomizingItem(null)} className="p-1 hover:bg-white/20 rounded-full"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1">
                      {getModifiersForItem(customizingItem).map(group => (
                          <div key={group.id} className="mb-6">
                              <h4 className="font-bold text-gray-700 mb-3 border-b pb-1">{group.title}</h4>
                              <div className="grid grid-cols-2 gap-2">
                                  {group.options.map(opt => {
                                      const isSelected = (selectedModifiers[group.id] || []).includes(opt.id);
                                      return (
                                          <button
                                              key={opt.id}
                                              onClick={() => toggleModifier(group.id, opt.id, group.type)}
                                              className={`
                                                  p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between
                                                  ${isSelected 
                                                      ? 'bg-primary/10 border-primary text-primary' 
                                                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                  }
                                              `}
                                          >
                                              <span>{opt.label}</span>
                                              {isSelected && <Check size={16} />}
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                      ))}

                      <div>
                          <h4 className="font-bold text-gray-700 mb-2">הערות נוספות</h4>
                          <textarea 
                              rows={3}
                              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none text-sm"
                              placeholder="רשום כאן הערות חופשיות..."
                              value={customNote}
                              onChange={(e) => setCustomNote(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
                      <button onClick={() => setCustomizingItem(null)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">ביטול</button>
                      <button onClick={confirmCustomization} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-700">הוסף להזמנה</button>
                  </div>
              </div>
          </div>
      )}

      {/* Note Editor Modal */}
      {editingNoteItem && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">עריכת הערות: {editingNoteItem.name}</h3>
                  <textarea 
                    autoFocus
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="לדוגמה: בלי בצל, רוטב בצד..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="flex gap-2">
                      <button onClick={() => setEditingNoteItem(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">ביטול</button>
                      <button onClick={saveNote} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-orange-700">שמור</button>
                  </div>
              </div>
          </div>
      )}

      {/* AI Integration */}
      {!showMobileCart && (
        <AIAssistant 
            currentOrder={currentOrder} 
            allItems={menuItems} 
            onAddItem={addToOrder} 
        />
      )}
    </div>
  );
};