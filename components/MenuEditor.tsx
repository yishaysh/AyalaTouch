
import React, { useState } from 'react';
import { Menu, MenuItem } from '../types';
import { Edit, Trash, Plus, Check, X, Star, Utensils, Search } from 'lucide-react';

interface MenuEditorProps {
  menus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
}

export const MenuEditor: React.FC<MenuEditorProps> = ({ menus, setMenus }) => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>(menus.find(m => m.isActive)?.id || menus[0].id);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedMenu = menus.find(m => m.id === selectedMenuId);

  const toggleActiveMenu = (id: string) => {
    setMenus(prev => prev.map(m => ({
      ...m,
      isActive: m.id === id
    })));
    setSelectedMenuId(id);
  };

  const createMenu = () => {
    if (!newMenuName.trim()) return;
    const newMenu: Menu = {
      id: `menu_${Date.now()}`,
      name: newMenuName,
      isActive: false,
      categories: ['כללי'],
      items: []
    };
    setMenus([...menus, newMenu]);
    setNewMenuName('');
    setIsCreatingMenu(false);
    setSelectedMenuId(newMenu.id);
  };

  const addCategory = () => {
    if (!newCategoryName.trim() || !selectedMenu) return;
    if (!selectedMenu.categories.includes(newCategoryName)) {
        const updatedMenu = {
        ...selectedMenu,
        categories: [...selectedMenu.categories, newCategoryName]
        };
        updateMenu(updatedMenu);
    }
    setNewCategoryName('');
  };

  const deleteCategory = (category: string) => {
    if (!selectedMenu) return;
    if (window.confirm(`האם למחוק את הקטגוריה "${category}" ואת כל הפריטים שבה?`)) {
        const updatedMenu = {
            ...selectedMenu,
            categories: selectedMenu.categories.filter(c => c !== category),
            items: selectedMenu.items.filter(i => i.category !== category)
        };
        updateMenu(updatedMenu);
    }
  };

  const updateMenu = (updatedMenu: Menu) => {
    setMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m));
  };

  const saveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenu || !editingItem) return;

    let updatedItems;
    if (selectedMenu.items.find(i => i.id === editingItem.id)) {
      // Edit existing
      updatedItems = selectedMenu.items.map(i => i.id === editingItem.id ? editingItem : i);
    } else {
      // Add new
      updatedItems = [...selectedMenu.items, editingItem];
    }

    updateMenu({ ...selectedMenu, items: updatedItems });
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    if (!selectedMenu) return;
    if (window.confirm('האם אתה בטוח שברצונך למחוק מנה זו?')) {
      updateMenu({
        ...selectedMenu,
        items: selectedMenu.items.filter(i => i.id !== itemId)
      });
    }
  };

  const createNewItem = (category: string) => {
    setEditingItem({
      id: `item_${Date.now()}`,
      name: '',
      price: 0,
      category: category,
      description: ''
    });
  };

  return (
    <div className="flex h-full bg-gray-50 flex-col md:flex-row">
      {/* Sidebar: Menu List */}
      <div className="w-full md:w-72 bg-white border-l p-6 flex flex-col gap-6 shadow-lg z-10">
        <div>
            <h2 className="font-bold text-2xl text-secondary mb-2">ניהול תפריטים</h2>
            <p className="text-sm text-gray-500">בחר תפריט לעריכה או צור חדש</p>
        </div>
        
        <div className="space-y-3">
          {menus.map(menu => (
            <button
              key={menu.id}
              onClick={() => setSelectedMenuId(menu.id)}
              className={`w-full p-4 rounded-xl text-right flex justify-between items-center group transition-all duration-200 ${
                selectedMenuId === menu.id 
                    ? 'bg-secondary text-white shadow-md transform scale-[1.02]' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="font-bold text-lg">{menu.name}</div>
                <div className={`text-xs ${selectedMenuId === menu.id ? 'text-gray-300' : 'text-gray-500'}`}>
                    {menu.items.length} פריטים • {menu.categories.length} קטגוריות
                </div>
              </div>
              {menu.isActive && <Star className={`${selectedMenuId === menu.id ? 'text-yellow-400' : 'text-yellow-500'} fill-current`} size={20} />}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 mt-auto">
            {isCreatingMenu ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in zoom-in duration-200">
                <label className="text-xs font-bold text-gray-500 mb-1 block">שם התפריט</label>
                <input
                type="text"
                autoFocus
                className="w-full p-2 mb-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                />
                <div className="flex gap-2">
                <button onClick={createMenu} className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors">צור</button>
                <button onClick={() => setIsCreatingMenu(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50">ביטול</button>
                </div>
            </div>
            ) : (
            <button 
                onClick={() => setIsCreatingMenu(true)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary hover:bg-orange-50 transition-all duration-200 font-medium"
            >
                <Plus size={20} />
                <span>צור תפריט חדש</span>
            </button>
            )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
        {selectedMenu ? (
          <>
            {/* Toolbar */}
            <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center shadow-sm sticky top-0 z-20">
              <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-secondary">{selectedMenu.name}</h2>
                    {selectedMenu.isActive && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">פעיל כעת</span>}
                </div>
              </div>
              <div className="flex gap-4 items-center">
                 <div className="relative hidden md:block">
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="חיפוש מנה..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 pl-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm w-64 transition-all"
                    />
                 </div>
                {!selectedMenu.isActive && (
                  <button 
                    onClick={() => toggleActiveMenu(selectedMenu.id)}
                    className="bg-secondary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    <Check size={18} />
                    <span className="font-bold">הגדר כפעיל</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
              <div className="max-w-6xl mx-auto space-y-10">
                
                {selectedMenu.categories.map(category => {
                    const items = selectedMenu.items.filter(i => i.category === category && i.name.includes(searchTerm));
                    if (searchTerm && items.length === 0) return null;

                    return (
                    <div key={category} className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1 bg-primary rounded-full"></div>
                            <h3 className="text-2xl font-bold text-gray-800">{category}</h3>
                            <span className="text-sm text-gray-400 font-normal">({items.length} מנות)</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => deleteCategory(category)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="מחק קטגוריה"
                            >
                                <Trash size={16} />
                            </button>
                            <button 
                                onClick={() => createNewItem(category)}
                                className="bg-white border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
                            >
                                <Plus size={16} /> הוסף מנה
                            </button>
                        </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-lg text-gray-800 line-clamp-1" title={item.name}>{item.name}</h4>
                                <span className="font-bold text-primary bg-orange-50 px-2 py-1 rounded-lg">₪{item.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-1 leading-relaxed">
                                {item.description || 'ללא תיאור'}
                            </p>
                            
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                                <button 
                                onClick={() => setEditingItem(item)}
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                <Edit size={14} /> ערוך
                                </button>
                                <button 
                                onClick={() => deleteItem(item.id)}
                                className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                <Trash size={14} /> מחק
                                </button>
                            </div>
                            </div>
                        ))}
                        {items.length === 0 && !searchTerm && (
                            <div className="col-span-full py-8 text-center text-gray-400 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                                אין עדיין מנות בקטגוריה זו
                            </div>
                        )}
                        </div>
                    </div>
                    )
                })}

                {/* Add Category Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-center justify-between">
                   <div>
                     <h4 className="font-bold text-lg text-gray-800">הוספת קטגוריה חדשה</h4>
                     <p className="text-sm text-gray-500">למשל: "ספיישלים", "טבעוני", "ילדים"</p>
                   </div>
                   <div className="flex gap-3">
                        <input 
                            type="text" 
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="שם הקטגוריה..." 
                            className="p-3 border border-gray-300 rounded-xl w-64 focus:ring-2 focus:ring-primary focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                        />
                        <button 
                            onClick={addCategory}
                            className="bg-secondary text-white px-6 py-3 rounded-xl hover:bg-slate-800 font-bold flex items-center gap-2 shadow-lg"
                        >
                            <Plus size={18} />
                            הוסף
                        </button>
                   </div>
                </div>
                
                <div className="h-10"></div> 
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
            <div className="bg-white p-8 rounded-full shadow-lg mb-6">
                <Utensils size={64} className="text-primary/50" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">ברוכים הבאים למערכת ניהול התפריט</h3>
            <p className="text-gray-500">בחר תפריט מהרשימה מימין כדי להתחיל לערוך</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={saveItem} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-xl text-secondary flex items-center gap-2">
                  <Edit size={20} className="text-primary" />
                  {editingItem.name ? 'עריכת מנה' : 'הוספת מנה חדשה'}
              </h3>
              <button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 hover:bg-white hover:text-gray-800 p-2 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">שם המנה</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  value={editingItem.name} 
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="לדוגמה: סלט קיסר"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">מחיר (₪)</label>
                  <div className="relative">
                      <input 
                        required
                        type="number" 
                        min="0"
                        step="0.5"
                        value={editingItem.price} 
                        onChange={(e) => setEditingItem({...editingItem, price: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none pl-8"
                      />
                      <span className="absolute left-3 top-3 text-gray-400">₪</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">קטגוריה</label>
                  <select 
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                  >
                    {selectedMenu?.categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">תיאור המנה</label>
                <textarea 
                  rows={4}
                  value={editingItem.description || ''} 
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="פרט מרכיבים, אלרגנים והערות מיוחדות..."
                />
              </div>
            </div>

            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
              <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-3 text-gray-600 font-medium hover:bg-white rounded-xl transition-colors">ביטול</button>
              <button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all transform active:scale-95">שמור שינויים</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
