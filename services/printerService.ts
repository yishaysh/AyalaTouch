import { Table, OrderItem } from '../types';

// Helper to generate CSS
const getStyles = () => `
  body { font-family: "Courier New", monospace; direction: rtl; padding: 10px; text-align: right; width: 80mm; margin: 0; }
  .header { text-align: center; font-weight: bold; font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
  .meta { margin-bottom: 15px; font-size: 16px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
  .item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 18px; font-weight: bold; align-items: flex-start; }
  .notes { font-size: 16px; margin-top: 2px; font-weight: normal; font-style: italic; }
  .urgent { color: white; background: black; padding: 2px 6px; border-radius: 4px; font-size: 14px; margin-left: 5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .footer { margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; text-align: center; font-size: 16px; }
  .sub-header { text-align: center; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
  .total { display: flex; justify-content: space-between; margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; font-size: 20px; font-weight: bold; }
  @media print { body { margin: 0; } @page { margin: 0; } }
`;

export const generateKitchenTicketHTML = (table: Table, items: OrderItem[]): string => {
  const date = new Date().toLocaleDateString('he-IL');
  const time = new Date().toLocaleTimeString('he-IL');

  let html = `<html><head><title>Kitchen Order</title><style>${getStyles()}</style></head><body>`;
  html += `<div class="header">הזמנה למטבח</div>`;
  html += `<div class="meta"><strong>שולחן: ${table.name}</strong><br>אורחים: ${table.guests}<br>תאריך: ${date} ${time}</div>`;

  items.forEach(item => {
     html += '<div>';
     html += `<div class="item"><span>${item.name}</span>${item.isUrgent ? '<span class="urgent">דחוף!</span>' : ''}</div>`;
     if (item.notes) {
        html += `<div class="notes">** ${item.notes} **</div>`;
     }
     html += '</div><br>';
  });

  html += `<div class="footer">-- סוף הזמנה --</div></body></html>`;
  return html;
};

export const generateBillHTML = (table: Table): string => {
  const date = new Date().toLocaleDateString('he-IL');
  const time = new Date().toLocaleTimeString('he-IL');
  const total = table.currentOrder.reduce((sum, item) => sum + item.price, 0);

  let html = `<html><head><title>Bill</title><style>${getStyles()}</style></head><body>`;
  html += `<div class="header">איילה פשוט טעים</div>`;
  html += `<div class="sub-header">חשבון לשולחן: ${table.name}<br>${date} ${time}</div>`;

  table.currentOrder.forEach(item => {
    html += `<div class="item"><span>${item.name}</span><span>₪${item.price}</span></div>`;
  });

  html += `<div class="total"><span>סה"כ לתשלום:</span><span>₪${total}</span></div>`;
  html += `<div class="footer">תודה רבה ולהתראות!</div></body></html>`;
  return html;
};