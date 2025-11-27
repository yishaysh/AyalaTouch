import React from 'react';
import { LayoutGrid, Coffee, Settings, ListChecks, ChefHat, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeView: string;
  setView: (view: string) => void;
  openChecklist: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, openChecklist, currentUser, onLogout }) => {
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    { id: 'floorplan', icon: LayoutGrid, label: 'שולחנות' },
    { id: 'kitchen', icon: ChefHat, label: 'מטבח' },
    // Admin items
    ...(isAdmin ? [
        { id: 'admin_dashboard', icon: LayoutDashboard, label: 'ניהול' },
        { id: 'menu_editor', icon: Coffee, label: 'תפריטים' }
    ] : []),
  ];

  const handleLogoutClick = () => {
      if (window.confirm('האם להתנתק מהמערכת?')) {
        onLogout();
      }
  };

  // Mobile Bottom Navigation
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary text-white pb-safe pt-2 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-50 flex justify-between items-center h-16 safe-area-bottom border-t border-slate-700">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${
            activeView === item.id ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <item.icon size={20} strokeWidth={activeView === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
      
      <button
        onClick={handleLogoutClick}
        className="flex flex-col items-center justify-center w-full gap-1 text-red-400"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium">יציאה</span>
      </button>
    </div>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden md:flex w-64 bg-secondary text-white flex-col h-screen sticky top-0 shadow-2xl z-50">
      <div className="p-6 flex items-center justify-start gap-3 border-b border-slate-700/50 bg-slate-900/50">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-500/20">A</div>
        <div>
            <span className="text-xl font-bold block leading-none">AyalaTouch</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">System</span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
          <div className="bg-slate-700 p-2 rounded-full">
              <UserIcon size={16} className="text-gray-300" />
          </div>
          <div>
              <div className="font-bold text-sm">{currentUser?.name}</div>
              <div className="text-xs text-gray-400">{isAdmin ? 'מנהל מערכת' : 'מלצר'}</div>
          </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
              activeView === item.id 
                ? 'bg-primary text-white shadow-lg shadow-orange-900/20 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={24} className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium text-sm tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50 flex flex-col gap-2 bg-slate-900/30">
        <button 
            onClick={openChecklist}
            className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <ListChecks size={20} />
          <span className="text-sm">רשימת דרישות</span>
        </button>
        
        <button 
            onClick={handleLogoutClick}
            className="flex items-center gap-3 p-3 text-red-400 hover:text-white hover:bg-red-900/30 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="text-sm">יציאה מהמערכת</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
};