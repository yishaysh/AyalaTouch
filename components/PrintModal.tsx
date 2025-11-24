import React from 'react';
import { Printer, X, Check } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  title: string;
  htmlContent: string;
  onClose: () => void;
  onConfirm: () => void; // Only updates state, printing happens inside
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, title, htmlContent, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    // Open a new window to bypass iframe sandbox restrictions
    const win = window.open('', '', 'width=400,height=600');
    if (win) {
        win.document.write(htmlContent);
        win.document.close();
        
        // Wait for content to load
        win.onload = () => {
            win.focus();
            win.print();
            // Optional: win.close(); // Automatically close after print
        };
    } else {
        alert('הדפדפן חסם את החלון הקופץ. אנא אשר חלונות קופצים לאתר זה.');
    }
    
    // Call parent confirm to update app state (e.g. mark as sent)
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 bg-secondary text-white flex justify-between items-center shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <Printer size={20} />
                {title}
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X size={20}/></button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
            <div 
                className="bg-white shadow-sm p-4 text-xs border border-gray-200 mx-auto w-[80mm] min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer size={18} />
            הדפס
          </button>
        </div>
      </div>
    </div>
  );
};