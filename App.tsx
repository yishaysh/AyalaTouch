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
import { LoginScreen } from './components/LoginScreen';
import { INITIAL_TABLES, INITIAL_MENUS, INITIAL_USERS } from './constants';
import { Table, TableStatus, OrderItem, Menu, PastOrder, User } from './types';
import { Loader2, CheckCircle, ChefHat, X, Lock, Clock } from 'lucide-react';
import { getWaitStaffChecklist } from './services/geminiService';
import { generateBillHTML, generateKitchenTicketHTML } from './services/printerService';
import { useFirebaseSync } from './hooks/useFirebaseSync';

const App: React.FC = () => {
  // --- SYNCED STATE ---
  const [tables, setTables] = useFirebaseSync<Table[]>('restaurants/ayala/tables', INITIAL_TABLES);
  const [menus, setMenus] = useFirebaseSync<Menu[]>('restaurants/ayala/menus', INITIAL_MENUS);
  const [users, setUsers] = useFirebaseSync<User[]>('restaurants/ayala/users', INITIAL_USERS);

  // --- LOCAL STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('floorplan');
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [, setTick] = useState(0);
  
  // UI States
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDestructive: boolean; }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDestructive: false });
  const [printModal, setPrintModal] = useState<{ isOpen: boolean; title: string; htmlContent: string; onConfirm: () => void; }>({ isOpen: false, title: '', htmlContent: '', onConfirm: () => {} });
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({ isVisible: false, message: '', type: 'success' });
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistContent, setChecklistContent] = useState("");
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  useEffect(() => {
      const interval = setInterval(() => setTick(t => t + 1), 60000);
      return () => clearInterval(interval);
  }, []);

  // --- SAFETY GUARDS ---
  const safeTables = Array.isArray(tables) ? tables : INITIAL_TABLES;
  const safeMenus = Array.isArray(menus) ? menus : INITIAL_MENUS;
  const safeUsers = Array.isArray(users) ? users : INITIAL_USERS;

  const activeMenu = safeMenus.find(m => m.isActive) || safeMenus[0];

  // --- AUTH HANDLERS ---
  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setActiveView('floorplan');
      showToast(`ברוך הבא, ${user.name}`);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setActiveView('floorplan');
      setSelectedTableId(null);
  };

  // --- UTILS ---
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
          'האם להפעיל מצב הדגמה? פעולה זו תדרוס את הנתונים בענן.',
          () => {
            // Create a clean deep copy from INITIAL_TABLES to avoid mutating state directly or reference issues
            const demoTables = JSON.parse(JSON.stringify(INITIAL_TABLES));
            const menuItems = activeMenu?.items || []; 

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

            // Populate demo data explicitly by index (matching ID logic)
            // Table 2 (Index 1)
            demoTables[1].status = TableStatus.OCCUPIED;
            demoTables[1].guests = 2;
            demoTables[1].startTime = new Date();
            demoTables[1].currentOrder = [getI('הפוך', 'חזק'), getI('תה צמחים')].filter(Boolean);

            // Table 3 (Index 2)
            demoTables[2].status = TableStatus.ORDERED;
            demoTables[2].guests = 3;
            demoTables[2].startTime = new Date(Date.now() - 1000 * 60 * 5); 
            demoTables[2].currentOrder = [getI('בוקר יחיד', 'ביצת עין'), getI('שקשוקה'), getI('קולה זירו')].filter(Boolean);

            // Table 4 (Index 3)
            demoTables[3].status = TableStatus.PAYMENT;
            demoTables[3].guests = 4;
            demoTables[3].startTime = new Date(Date.now() - 1000 * 60 * 55);
            demoTables[3].currentOrder = [getI('סלט יווני'), getI('טוסט קלאסי'), getI('פסטה'), getI('לימונדה'), getI('תפוזים')].filter(Boolean);

            // Table 6 (Index 5)
            demoTables[5].status = TableStatus.ORDERED;
            demoTables[5].guests = 2;
            demoTables[5].startTime = new Date(Date.now() - 1000 * 60 * 25); 
            demoTables[5].currentOrder = [getI('רביולי', 'בלי פרמזן', true), getI('פילה סלמון', '', true)].filter(Boolean);
            // Fallback if Salmon not found
            if (demoTables[5].currentOrder.length < 2) demoTables[5].currentOrder.push(getI('לזניה', '', true));

            // Table 7 (Index 6)
            demoTables[6].status = TableStatus.ORDERED;
            demoTables[6].guests = 5;
            demoTables[6].startTime = new Date(Date.now() - 1000 * 60 * 15);
            demoTables[6].currentOrder = [getI('כריך בלקני'), getI('כריך סביח'), getI('סלט קינואה'), getI('קולה'), getI('מים')].filter(Boolean);

            // Table 9 (Index 8)
            demoTables[8].status = TableStatus.OCCUPIED;
            demoTables[8].guests = 1;
            demoTables[8].startTime = new Date(Date.now() - 1000 * 60 * 10);
            demoTables[8].currentOrder = [getI('אספרסו'), getI('עוגת')].filter(Boolean);

            // Important: Pass the new full object to setTables. 
            // The hook will sanitize and upload it.
            setTables(demoTables);
            showToast('מצב הדגמה הופעל וסונכרן לענן!');
            setActiveView('floorplan'); 
          },
          true
      );
  };

  const handleResetData = () => {
      requestConfirmation(
          'איפוס נתונים',
          'האם לאפס את כל הנתונים למצב התחלתי?',
          () => {
            setTables(JSON.parse(JSON.stringify(INITIAL_TABLES)));
            showToast('הנתונים אופסו בענן');
          },
          true
      );
  };

  // --- Handlers ---
  const handleTableSelect = (id: number) => { setSelectedTableId(id); };
  
  const handleUpdateOrder = (items: OrderItem[]) => {
    setTables((prev: Table[]) => {
        const current = Array.isArray(prev) ? prev : INITIAL_TABLES;
        return current.map(t => t.id === selectedTableId ? { ...t, currentOrder: items, status: items.length > 0 ? TableStatus.OCCUPIED : TableStatus.FREE } : t);
    });
  };
  
  const handleUpdateGuests = (guests: number) => {
    if (selectedTableId === null) return;
    setTables((prev: Table[]) => {
        const current = Array.isArray(prev) ? prev : INITIAL_TABLES;
        return current.map(t => t.id === selectedTableId ? { ...t, guests } : t);
    });
  };
  
  const handleSendOrderTrigger = () => { 
      if (selectedTableId === null) return;
      const table = safeTables.find(t => t.id === selectedTableId);
      if (!table) return;
      const html = generateKitchenTicketHTML(table, table.currentOrder || []);
      setPrintModal({ isOpen: true, title: 'הדפסת בון למטבח', htmlContent: html, onConfirm: () => {
          setTables((prev: Table[]) => {
              const current = Array.isArray(prev) ? prev : INITIAL_TABLES;
              return current.map(t => t.id === selectedTableId ? { ...t, status: TableStatus.ORDERED, startTime: t.startTime || new Date() } : t);
          });
          showToast('ההזמנה נשלחה למטבח');
          setSelectedTableId(null);
      }});
  };
  
  const handlePrintBillTrigger = () => { 
      if (selectedTableId === null) return;
      const table = safeTables.find(t => t.id === selectedTableId);
      if (!table) return;
      const html = generateBillHTML(table);
      setPrintModal({ isOpen: true, title: 'הדפסת חשבון', htmlContent: html, onConfirm: () => { showToast('חשבון הודפס'); } });
  };
  
  const handleRequestBillTrigger = () => { requestConfirmation('בקשת חשבון', 'לסמן כמבקש חשבון?', () => { if (selectedTableId === null) return; setTables((prev: Table[]) => { const current = Array.isArray(prev) ? prev : INITIAL_TABLES; return current.map(t => t.id === selectedTableId ? { ...t, status: TableStatus.PAYMENT } : t); }); showToast('עודכן'); setSelectedTableId(null); }, false); };
  
  const handleCloseTableTrigger = () => { requestConfirmation('סגירת חשבון', 'לבצע צ׳ק אאוט?', () => { if (selectedTableId === null) return; setTables((prev: Table[]) => { const current = Array.isArray(prev) ? prev : INITIAL_TABLES; return current.map(t => { if (t.id === selectedTableId) { const newHistory = [...(t.orderHistory || [])]; if ((t.currentOrder || []).length > 0) { newHistory.unshift({ id: `hist_${Date.now()}`, items: [...t.currentOrder], total: t.currentOrder.reduce((acc, i) => acc + i.price, 0), date: new Date() }); } return { ...t, status: TableStatus.FREE, currentOrder: [], guests: 0, startTime: undefined, orderHistory: newHistory }; } return t; }); }); setSelectedTableId(null); showToast('החשבון נסגר'); }, false); };
  
  const handleResetTableTrigger = () => { requestConfirmation('איפוס שולחן', 'מחיקה ללא שמירה.', () => { if (selectedTableId === null) return; setTables((prev: Table[]) => { const current = Array.isArray(prev) ? prev : INITIAL_TABLES; return current.map(t => t.id === selectedTableId ? { ...t, status: TableStatus.FREE, currentOrder: [], guests: 0, startTime: undefined } : t); }); setSelectedTableId(null); showToast('אופס', 'error'); }, true); };
  
  const handleEndShiftTrigger = () => { requestConfirmation('סיום משמרת', 'איפוס כללי.', () => { setTables((prev: Table[]) => { const current = Array.isArray(prev) ? prev : INITIAL_TABLES; return current.map(t => { const newHistory = [...(t.orderHistory || [])]; if ((t.currentOrder || []).length > 0) { newHistory.unshift({ id: `hist_shift_${Date.now()}`, items: [...t.currentOrder], total: t.currentOrder.reduce((acc, i) => acc + i.price, 0), date: new Date() }); } return { ...t, status: TableStatus.FREE, currentOrder: [], guests: 0, startTime: undefined, orderHistory: newHistory }; }); }); showToast('משמרת הסתיימה'); }, true); };
  
  const fetchChecklist = async () => { setShowChecklist(true); if (!checklistContent) { setLoadingChecklist(true); const content = await getWaitStaffChecklist(); setChecklistContent(content); setLoadingChecklist(false); } }
  
  const selectedTable = safeTables.find(t => t.id === selectedTableId);
  const getElapsedMinutes = (startTime?: Date) => { if (!startTime) return 0; return Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 60000); };
  const getTimerColor = (minutes: number) => { if (minutes > 20) return 'bg-red-100 border-red-300 text-red-800 animate-pulse'; if (minutes > 10) return 'bg-yellow-100 border-yellow-300 text-yellow-800'; return 'bg-white border-primary'; };

  // --- RENDER LOGIC ---
  if (!currentUser) {
      return <LoginScreen users={safeUsers} onLogin={handleLogin} />;
  }

  return (
    <div className="flex w-full h-[100dvh] bg-slate-50 font-sans text-slate-900 flex-col md:flex-row overflow-hidden">
      <NetworkStatus />
      <div className="order-2 md:order-1 w-full md:w-auto z-50 shrink-0">
        <Sidebar 
            activeView={activeView} 
            setView={setActiveView} 
            openChecklist={fetchChecklist}
            onOpenAdmin={() => {}} 
            isAdmin={currentUser.role === 'admin'}
            currentUser={currentUser}
            onLogout={handleLogout}
        />
      </div>
      <main className="flex-1 h-full relative order-1 md:order-2 bg-slate-50 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full pb-24 md:pb-6 pt-10 md:pt-0">
            {activeView === 'floorplan' && <TableMap tables={safeTables} onTableSelect={handleTableSelect} />}
            
            {activeView === 'kitchen' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    <div className="col-span-full pb-0"><h2 className="text-2xl md:text-3xl font-bold text-secondary flex items-center gap-3"><ChefHat /> מסך מטבח</h2></div>
                    {safeTables.filter(t => t.status === TableStatus.ORDERED).length === 0 && <p className="text-gray-500 text-lg col-span-full">אין הזמנות ממתינות במטבח כרגע.</p>}
                    {safeTables.filter(t => t.status === TableStatus.ORDERED).map(t => {
                        const elapsed = getElapsedMinutes(t.startTime);
                        return (
                        <div key={t.id} className={`border-l-4 rounded-xl shadow-sm p-4 ${getTimerColor(elapsed)}`}>
                            <div className="flex justify-between border-b pb-2 mb-2">
                                <span className="font-bold text-lg">{t.name}</span>
                                <div className="flex items-center gap-2"><Clock size={14} /><span className="font-mono text-sm font-bold">{elapsed} דק'</span></div>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {(t.currentOrder || []).map(item => (
                                    <li key={item.uniqueId} className={`flex justify-between items-center text-sm p-2 rounded ${item.isUrgent ? 'bg-red-200 text-red-900 font-bold' : ''}`}>
                                        <span>{item.name} {item.isUrgent && <span className="mr-2 text-xs bg-red-600 text-white px-1 rounded">דחוף</span>}</span>
                                        {item.notes && <span className="text-xs text-gray-600 bg-white/50 px-1 rounded">{item.notes}</span>}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => { setTables((prev: Table[]) => { const current = Array.isArray(prev) ? prev : INITIAL_TABLES; return current.map(table => table.id === t.id ? {...table, status: TableStatus.PAYMENT} : table); }); showToast(`שולחן ${t.name} סומן כמוכן`); }} className="w-full py-2 bg-white/50 hover:bg-emerald-100 hover:text-emerald-700 border border-transparent hover:border-emerald-200 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2">
                                <CheckCircle size={16} /> סמן כמוכן
                            </button>
                        </div>
                    )})}
                 </div>
            )}
            
            {activeView === 'menu_editor' && currentUser.role === 'admin' && <MenuEditor menus={safeMenus} setMenus={setMenus} />}
            
            {activeView === 'admin_dashboard' && currentUser.role === 'admin' && (
                <AdminDashboard 
                    tables={safeTables} 
                    onEndShift={handleEndShiftTrigger} 
                    onRunSimulation={handleRunSimulation} 
                    onResetData={handleResetData}
                    users={safeUsers}
                    setUsers={setUsers}
                />
            )}
        </div>
        {selectedTable && <OrderInterface table={selectedTable} menuItems={activeMenu.items} categories={activeMenu.categories} onClose={() => setSelectedTableId(null)} onUpdateOrder={handleUpdateOrder} onUpdateGuests={handleUpdateGuests} onSendOrder={handleSendOrderTrigger} onRequestBill={handleRequestBillTrigger} onPrintBill={handlePrintBillTrigger} onCloseTable={handleCloseTableTrigger} onResetTable={handleResetTableTrigger} />}
        
        {/* Checklist & Utils */}
        {showChecklist && <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"><div className="p-4 border-b flex justify-between items-center bg-secondary text-white"><h3 className="font-bold text-xl">רשימת דרישות להקמת האפליקציה</h3><button onClick={() => setShowChecklist(false)} className="hover:bg-white/20 p-2 rounded-full"><X /></button></div><div className="p-8 overflow-y-auto text-right" dir="rtl">{loadingChecklist ? <div className="flex flex-col items-center justify-center py-10 gap-4 text-primary"><Loader2 size={40} className="animate-spin" /><p>מייצר רשימה חכמה...</p></div> : <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: checklistContent }} />}</div></div></div>}
        <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} isDestructive={confirmModal.isDestructive} />
        <PrintModal isOpen={printModal.isOpen} title={printModal.title} htmlContent={printModal.htmlContent} onConfirm={() => { printModal.onConfirm(); setPrintModal(prev => ({...prev, isOpen: false})); }} onClose={() => setPrintModal(prev => ({...prev, isOpen: false}))} />
        <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
      </main>
    </div>
  );
};

export default App;