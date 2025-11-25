import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TableMap } from './components/TableMap';
import { OrderInterface } from './components/OrderInterface';
import { MenuEditor } from './components/MenuEditor';
import { AdminDashboard } from './components/AdminDashboard';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PrintModal } from './components/PrintModal';
import { Toast, ToastType } from './components/Toast';
import { NetworkStatus } from './components/NetworkStatus'; 
import { INITIAL_TABLES, INITIAL_MENUS } from './constants';
import { Table, TableStatus, OrderItem, Menu, PastOrder } from './types';
import { getWaitStaffChecklist } from './services/geminiService';
import { generateBillHTML, generateKitchenTicketHTML } from './services/printerService';
import { Loader2, CheckCircle, ChefHat, X, Lock, Clock } from 'lucide-react';

// --- Custom Hook for Persistent State ---
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue, (k, v) => {
            if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
                return new Date(v);
            }
            return v;
        });
      }
      return JSON.parse(JSON.stringify(initialValue));
    } catch (error) {
      console.error(`Error loading ${key} from storage`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to storage`, error);
    }
  }, [key, state]);

  return [state, setState];
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('floorplan');
  const [tables, setTables] = usePersistentState<Table[]>('ayala_tables_v1', INITIAL_TABLES);
  const [menus, setMenus] = usePersistentState<Menu[]>('ayala_menus_v1', INITIAL_MENUS);
  
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [, setTick] = useState(0);
  useEffect(() => {
      const interval = setInterval(() => setTick(t => t + 1), 60000);
      return () => clearInterval(interval);
  }, []);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDestructive: false });

  const [printModal, setPrintModal] = useState<{
      isOpen: boolean;
      title: string;
      htmlContent: string;
      onConfirm: () => void;
  }>({ isOpen: false, title: '', htmlContent: '', onConfirm: () => {} });

  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistContent, setChecklistContent] = useState("");
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  const activeMenu = menus.find(m => m.isActive) || menus[0];

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const requestConfirmation = (title: string, message: string, onConfirm: () => void, isDestructive = false) => {
    setConfirmModal({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
            onConfirm();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        isDestructive
    });
  };

  // --- Simulation Handlers ---
  const handleRunSimulation = () => {
      requestConfirmation(
          'הפעלת מצב הדגמה',
          'האם להפעיל מצב הדגמה? פעולה זו תדרוס את הנתונים הנוכחיים ותאכלס את המערכת בנתוני דמה מלאים.',
          () => {
            const demoTables = JSON.parse(JSON.stringify(INITIAL_TABLES));
            const menuItems = activeMenu.items;

            const getI = (namePart: string, notes: string = '', urgent: boolean = false) => {
                const item = menuItems.find(i => i.name.includes(namePart));
                if (!item) return null;
                return { 
                    ...item, 
                    uniqueId: Math.random().toString(36).substr(2, 9),
                    notes,
                    isUrgent: urgent
                };
            };

            demoTables[1].status = TableStatus.OCCUPIED;
            demoTables[1].guests = 2;
            demoTables[1].startTime = new Date();
            demoTables[1].currentOrder = [getI('הפוך', 'חזק'), getI('תה צמחים')].filter(Boolean);

            demoTables[2].status = TableStatus.ORDERED;
            demoTables[2].guests = 3;
            demoTables[2].startTime = new Date(Date.now() - 1000 * 60 * 5); 
            demoTables[2].currentOrder = [getI('בוקר יחיד', 'ביצת עין'), getI('שקשוקה'), getI('קולה זירו')].filter(Boolean);

            demoTables[3].status = TableStatus.PAYMENT;
            demoTables[3].guests = 4;
            demoTables[3].startTime = new Date(Date.now() - 1000 * 60 * 55);
            demoTables[3].currentOrder = [getI('סלט יווני'), getI('טוסט קלאסי'), getI('פסטה'), getI('לימונדה'), getI('תפוזים')].filter(Boolean);

            demoTables[5].status = TableStatus.ORDERED;
            demoTables[5].guests = 2;
            demoTables[5].startTime = new Date(Date.now() - 1000 * 60 * 25); 
            demoTables[5].currentOrder = [getI('רביולי', 'בלי פרמזן', true), getI('פילה סלמון', '', true)].filter(Boolean);
            if (demoTables[5].currentOrder.length < 2) demoTables[5].currentOrder.push(getI('לזניה', '', true));

            demoTables[6].status = TableStatus.ORDERED;
            demoTables[6].guests = 5;
            demoTables[6].startTime = new Date(Date.now() - 1000 * 60 * 15);
            demoTables[6].currentOrder = [getI('כריך בלקני'), getI('כריך סביח'), getI('סלט קינואה'), getI('קולה'), getI('מים')].filter(Boolean);

            demoTables[8].status = TableStatus.OCCUPIED;
            demoTables[8].guests = 1;
            demoTables[8].startTime = new Date(Date.now() - 1000 * 60 * 10);
            demoTables[8].currentOrder = [getI('אספרסו'), getI('עוגת')].filter(Boolean);

            setTables(demoTables);
            showToast('מצב הדגמה הופעל: המטבח והשולחנות מלאים!');
            setActiveView('floorplan'); 
          },
          true
      );
  };

  const handleResetData = () => {
      requestConfirmation(
          'איפוס נתונים',
          'האם לאפס את כל הנתונים למצב התחלתי? כל השינויים יימחקו.',
          () => {
            setTables(JSON.parse(JSON.stringify(INITIAL_TABLES)));
            showToast('הנתונים אופסו בהצלחה');
          },
          true
      );
  };

  // --- Handlers ---
  const handleTableSelect = (id: number) => { setSelectedTableId(id); };
  const handleUpdateOrder = (items: OrderItem[]) => {
    setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, currentOrder: items, status: items.length > 0 ? TableStatus.OCCUPIED : TableStatus.FREE } : t));
  };
  const handleUpdateGuests = (guests: number) => {
    if (selectedTableId === null) return;
    setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, guests } : t));
  };
  const handleSendOrderTrigger = () => {
    if (selectedTableId === null) return;
    const table = tables.find(t => t.id === selectedTableId);
    if (!table) return;
    const html = generateKitchenTicketHTML(table, table.currentOrder);
    setPrintModal({ isOpen: true, title: 'הדפסת בון למטבח', htmlContent: html, onConfirm: () => {
        setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, status: TableStatus.ORDERED, startTime: t.startTime || new Date() } : t));
        showToast('ההזמנה נשלחה למטבח');
        setSelectedTableId(null);
    }});
  };
  const handlePrintBillTrigger = () => {
    if (selectedTableId === null) return;
    const table = tables.find(t => t.id === selectedTableId);
    if (!table) return;
    const html = generateBillHTML(table);
    setPrintModal({ isOpen: true, title: 'הדפסת חשבון', htmlContent: html, onConfirm: () => { showToast('חשבון הודפס'); } });
  };
  const handleRequestBillTrigger = () => {
      requestConfirmation('בקשת חשבון', 'האם לסמן שולחן זה כמבקש חשבון?', () => {
        if (selectedTableId === null) return;
        setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, status: TableStatus.PAYMENT } : t));
        showToast('סטטוס השולחן עודכן');
        setSelectedTableId(null);
      }, false);
  };
  const handleCloseTableTrigger = () => {
    requestConfirmation('סגירת חשבון', 'האם לסגור את השולחן ולבצע צ׳ק אאוט?', () => {
        if (selectedTableId === null) return;
        setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
            const newHistory = [...(t.orderHistory || [])];
            if (t.currentOrder.length > 0) {
                const pastOrder: PastOrder = { id: `hist_${Date.now()}`, items: [...t.currentOrder], total: t.currentOrder.reduce((acc, i) => acc + i.price, 0), date: new Date() };
                newHistory.unshift(pastOrder);
            }
            return { ...t, status: TableStatus.FREE, currentOrder: [], guests: 0, startTime: undefined, orderHistory: newHistory };
        }
        return t;
        }));
        setSelectedTableId(null);
        showToast('החשבון נסגר בהצלחה');
    }, false);
  };
  const handleResetTableTrigger = () => {
    requestConfirmation('איפוס שולחן', 'פעולה זו תמחק את ההזמנה הנוכחית ללא שמירה. האם להמשיך?', () => {
        if (selectedTableId === null) return;
        setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, status: TableStatus.FREE, currentOrder: [], guests: 0, startTime: undefined } : t));
        setSelectedTableId(null);
        showToast('השולחן אופס בהצלחה', 'error');
    }, true);
  };
  const handleEndShiftTrigger = () => {
      requestConfirmation('סיום משמרת', 'פעולה זו תאפס את כל השולחנות הפעילים. האם להמשיך?', () => {
        setTables(prev => prev.map(t => {
            const newHistory = [...(t.orderHistory || [])];
            if (t.currentOrder.length > 0) {
                const pastOrder: PastOrder = { id: `hist_shift_${Date.now()}`, items: [...t.currentOrder], total: t.currentOrder.reduce((acc, i) => acc + i.price, 0), date: new Date() };
                newHistory.unshift(pastOrder);
            }
            return { ...t, status: TableStatus.FREE, currentOrder: [], guests: 0, startTime: undefined, orderHistory: newHistory };
        }));
        showToast('משמרת הסתיימה בהצלחה');
      }, true);
  };
  const handleAdminLogin = (e: React.FormEvent) => { e.preventDefault(); if (adminPin === '1234') { setIsAdmin(true); setShowAdminLogin(false); setActiveView('admin_dashboard'); setAdminPin(''); setLoginError(false); } else { setLoginError(true); } };
  const fetchChecklist = async () => { setShowChecklist(true); if (!checklistContent) { setLoadingChecklist(true); const content = await getWaitStaffChecklist(); setChecklistContent(content); setLoadingChecklist(false); } }

  const selectedTable = tables.find(t => t.id === selectedTableId);

  // --- KDS Logic ---
  const getElapsedMinutes = (startTime?: Date) => { if (!startTime) return 0; return Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 60000); };
  const getTimerColor = (minutes: number) => { if (minutes > 20) return 'bg-red-100 border-red-300 text-red-800 animate-pulse'; if (minutes > 10) return 'bg-yellow-100 border-yellow-300 text-yellow-800'; return 'bg-white border-primary'; };

  // Render Kitchen View
  const renderKitchen = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {tables.filter(t => t.status === TableStatus.ORDERED).length === 0 && <p className="text-gray-500 text-lg">אין הזמנות ממתינות במטבח כרגע.</p>}
        {tables.filter(t => t.status === TableStatus.ORDERED).map(t => {
            const elapsed = getElapsedMinutes(t.startTime);
            return (
            <div key={t.id} className={`border-l-4 rounded-xl shadow-sm p-4 ${getTimerColor(elapsed)}`}>
                <div className="flex justify-between border-b pb-2 mb-2">
                    <span className="font-bold text-lg">{t.name}</span>
                    <div className="flex items-center gap-2"><Clock size={14} /><span className="font-mono text-sm font-bold">{elapsed} דק'</span></div>
                </div>
                <ul className="space-y-2 mb-4">
                    {t.currentOrder.map(item => (
                        <li key={item.uniqueId} className={`flex justify-between items-center text-sm p-2 rounded ${item.isUrgent ? 'bg-red-200 text-red-900 font-bold' : ''}`}>
                            <span>{item.name} {item.isUrgent && <span className="mr-2 text-xs bg-red-600 text-white px-1 rounded">דחוף</span>}</span>
                            {item.notes && <span className="text-xs text-gray-600 bg-white/50 px-1 rounded">{item.notes}</span>}
                        </li>
                    ))}
                </ul>
                <button onClick={() => { setTables(prev => prev.map(table => table.id === t.id ? {...table, status: TableStatus.PAYMENT} : table)); showToast(`שולחן ${t.name} סומן כמוכן`); }} className="w-full py-2 bg-white/50 hover:bg-emerald-100 hover:text-emerald-700 border border-transparent hover:border-emerald-200 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2">
                    <CheckCircle size={16} /> סמן כמוכן
                </button>
            </div>
        )})}
     </div>
  );

  return (
    <div className="flex w-full h-[100dvh] bg-slate-50 font-sans text-slate-900 flex-col md:flex-row overflow-hidden">
      <NetworkStatus />
      
      {/* Sidebar - Fixed Bottom on Mobile */}
      <div className="order-2 md:order-1 w-full md:w-auto z-50 shrink-0">
        <Sidebar 
            activeView={activeView} 
            setView={setActiveView} 
            openChecklist={fetchChecklist}
            onOpenAdmin={() => setShowAdminLogin(true)}
            isAdmin={isAdmin}
            onLogout={() => { setIsAdmin(false); setActiveView('floorplan'); }}
        />
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 h-full relative order-1 md:order-2 bg-slate-50 overflow-y-auto overflow-x-hidden">
        {/* Added scrollable wrapper with padding for mobile nav */}
        <div className="min-h-full pb-24 md:pb-6 pt-10 md:pt-0">
            {activeView === 'floorplan' && (
            <TableMap tables={tables} onTableSelect={handleTableSelect} />
            )}
            
            {activeView === 'kitchen' && (
                <div>
                    <div className="p-6 pb-0"><h2 className="text-2xl md:text-3xl font-bold text-secondary flex items-center gap-3"><ChefHat /> מסך מטבח</h2></div>
                    {renderKitchen()}
                </div>
            )}
            
            {activeView === 'menu_editor' && isAdmin && (
                <MenuEditor menus={menus} setMenus={setMenus} />
            )}

            {activeView === 'admin_dashboard' && isAdmin && (
                <AdminDashboard 
                    tables={tables} 
                    onEndShift={handleEndShiftTrigger}
                    onRunSimulation={handleRunSimulation}
                    onResetData={handleResetData}
                />
            )}
        </div>

        {/* Order Interface Modal */}
        {selectedTable && (
          <OrderInterface 
            table={selectedTable}
            menuItems={activeMenu.items}
            categories={activeMenu.categories}
            onClose={() => setSelectedTableId(null)}
            onUpdateOrder={handleUpdateOrder}
            onUpdateGuests={handleUpdateGuests}
            onSendOrder={handleSendOrderTrigger}
            onRequestBill={handleRequestBillTrigger}
            onPrintBill={handlePrintBillTrigger}
            onCloseTable={handleCloseTableTrigger}
            onResetTable={handleResetTableTrigger}
          />
        )}

        {/* Modals */}
        {showAdminLogin && (
             <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in">
                    <button onClick={() => { setShowAdminLogin(false); setLoginError(false); }} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"><X /></button>
                    <div className="flex flex-col items-center mb-6"><div className="bg-gray-100 p-4 rounded-full mb-4"><Lock size={32} className="text-secondary" /></div><h2 className="text-2xl font-bold text-secondary">כניסת מנהל</h2><p className="text-gray-500">הזן קוד גישה לניהול (1234)</p></div>
                    <form onSubmit={handleAdminLogin} className="space-y-4"><input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} className="w-full text-center text-4xl tracking-[1em] font-bold p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} autoFocus />{loginError && <p className="text-red-500 text-center font-bold">קוד שגוי, נסה שנית</p>}<button type="submit" className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors">כנס למערכת</button></form>
                </div>
             </div>
        )}
        {showChecklist && <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"><div className="p-4 border-b flex justify-between items-center bg-secondary text-white"><h3 className="font-bold text-xl">רשימת דרישות להקמת האפליקציה</h3><button onClick={() => setShowChecklist(false)} className="hover:bg-white/20 p-2 rounded-full"><X /></button></div><div className="p-8 overflow-y-auto text-right" dir="rtl">{loadingChecklist ? <div className="flex flex-col items-center justify-center py-10 gap-4 text-primary"><Loader2 size={40} className="animate-spin" /><p>מייצר רשימה חכמה...</p></div> : <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: checklistContent }} />}</div></div></div>}
        <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} isDestructive={confirmModal.isDestructive} />
        <PrintModal isOpen={printModal.isOpen} title={printModal.title} htmlContent={printModal.htmlContent} onConfirm={() => { printModal.onConfirm(); setPrintModal(prev => ({...prev, isOpen: false})); }} onClose={() => setPrintModal(prev => ({...prev, isOpen: false}))} />
        <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
      </main>
    </div>
  );
};

export default App;