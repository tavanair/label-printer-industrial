import { LabelLayout } from '../types';

export const DEFAULT_LABEL_LAYOUT: LabelLayout = {
  showBorder: true,
  gridSize: 2,
  elements: [
    { id: 'side-box', label: 'Sidebar block', kind: 'box', x: 0, y: 0, w: 26, h: 100, fontSize: 10, visible: true, background: '#ffffff', border: true },
    { id: 'main-divider', label: 'Main divider', kind: 'line', x: 26, y: 0, w: 0, h: 100, fontSize: 10, visible: true, border: true },
    { id: 'header-line', label: 'Header line', kind: 'line', x: 26, y: 24, w: 74, h: 0, fontSize: 10, visible: true, border: true },
    { id: 'sender-line', label: 'Sender line', kind: 'line', x: 26, y: 39, w: 74, h: 0, fontSize: 10, visible: true, border: true },
    { id: 'receiver-line', label: 'Receiver line', kind: 'line', x: 26, y: 76, w: 74, h: 0, fontSize: 10, visible: true, border: true },
    { id: 'grid-line', label: 'Details divider', kind: 'line', x: 63, y: 76, w: 0, h: 24, fontSize: 10, visible: true, border: true },

    { id: 'logo', label: 'Logo', kind: 'logo', x: 82, y: 2, w: 14, h: 19, fontSize: 10, visible: true, align: 'center' },
    { id: 'tracking-title', label: 'Tracking title', kind: 'text', staticText: 'برچسب کد رهگیری و اعتبارسنجی 3PDL', x: 31, y: 3, w: 48, h: 5, fontSize: 9, bold: true, visible: true, align: 'center', direction: 'rtl' },
    { id: 'barcode', label: 'Barcode', kind: 'barcode', field: 'barcode', x: 32, y: 8, w: 46, h: 13, fontSize: 10, visible: true, align: 'center' },
    { id: 'qr', label: 'QR code', kind: 'qr', field: 'qrData', x: 6, y: 3, w: 14, h: 14, fontSize: 10, visible: true, align: 'center' },
    { id: 'qr-caption', label: 'QR caption', kind: 'text', staticText: 'رهگیری در سایت', x: 2, y: 18, w: 22, h: 4, fontSize: 8, bold: true, visible: true, align: 'center', direction: 'rtl' },
    { id: 'tracking-site', label: 'Tracking site', kind: 'text', staticText: 'tracking.post.ir', x: 2, y: 22, w: 22, h: 4, fontSize: 6, visible: true, align: 'center', direction: 'ltr' },
    { id: 'warehouse', label: 'Warehouse', kind: 'text', staticText: 'انبار مکانیزه', x: 2, y: 29, w: 22, h: 7, fontSize: 10, bold: true, visible: true, align: 'center', direction: 'rtl', background: '#000000', color: '#ffffff' },
    { id: 'biz-link', label: 'BIZ link', kind: 'text', staticText: 'bizmlm.ir', x: 3, y: 40, w: 20, h: 5, fontSize: 11, bold: true, visible: true, align: 'center', direction: 'ltr' },

    { id: 'order-label', label: 'Order label', kind: 'text', staticText: 'شناسه سفارش', x: 3, y: 52, w: 20, h: 5, fontSize: 10, bold: true, visible: true, align: 'center', direction: 'rtl' },
    { id: 'order-id', label: 'Order ID', kind: 'text', field: 'orderId', x: 8, y: 59, w: 10, h: 24, fontSize: 16, bold: true, visible: true, align: 'center', direction: 'rtl', vertical: true },
    { id: 'date', label: 'Date', kind: 'text', field: 'date', x: 5, y: 85, w: 7, h: 12, fontSize: 10, bold: true, visible: true, align: 'center', direction: 'rtl', vertical: true },
    { id: 'time', label: 'Time', kind: 'text', field: 'time', x: 13, y: 85, w: 7, h: 12, fontSize: 10, bold: true, visible: true, align: 'center', direction: 'rtl', vertical: true },

    { id: 'sender-name', label: 'Sender name', kind: 'text', field: 'senderName', prefix: 'فرستنده: ', x: 30, y: 27, w: 63, h: 5, fontSize: 11, visible: true, align: 'right', direction: 'rtl' },
    { id: 'sender-address', label: 'Sender address', kind: 'text', field: 'senderAddress', prefix: 'آدرس: ', x: 30, y: 32, w: 63, h: 6, fontSize: 10, visible: true, align: 'right', direction: 'rtl' },
    { id: 'receiver-city', label: 'Receiver city', kind: 'text', field: 'receiverCity', prefix: 'گیرنده: ', x: 30, y: 43, w: 63, h: 7, fontSize: 12, bold: true, visible: true, align: 'right', direction: 'rtl' },
    { id: 'receiver-address', label: 'Receiver address', kind: 'text', field: 'receiverAddress', x: 30, y: 51, w: 63, h: 20, fontSize: 11, visible: true, align: 'right', direction: 'rtl' },

    { id: 'receiver-name', label: 'Receiver name', kind: 'text', field: 'receiverName', x: 65, y: 79, w: 29, h: 5, fontSize: 11, bold: true, visible: true, align: 'right', direction: 'rtl' },
    { id: 'post-code', label: 'Post code', kind: 'text', field: 'receiverPostCode', prefix: 'کدپستی ', x: 31, y: 79, w: 29, h: 5, fontSize: 10, bold: true, visible: true, align: 'right', direction: 'rtl' },
    { id: 'phone', label: 'Phone', kind: 'text', field: 'receiverPhone', prefix: 'تلفن ', x: 65, y: 87, w: 29, h: 5, fontSize: 10, bold: true, visible: true, align: 'right', direction: 'rtl' },
    { id: 'mobile', label: 'Mobile', kind: 'text', field: 'receiverMobile', prefix: 'موبایل ', x: 31, y: 87, w: 29, h: 5, fontSize: 10, bold: true, visible: true, align: 'right', direction: 'rtl' },
    { id: 'weight', label: 'Weight', kind: 'text', field: 'weight', prefix: 'وزن ', suffix: ' گرم', x: 65, y: 94, w: 29, h: 5, fontSize: 14, bold: true, visible: true, align: 'right', direction: 'rtl' },
    { id: 'payment', label: 'Payment', kind: 'text', field: 'price', x: 31, y: 94, w: 29, h: 5, fontSize: 9, bold: true, visible: true, align: 'center', direction: 'rtl' },
  ],
};

export const cloneDefaultLayout = (): LabelLayout => JSON.parse(JSON.stringify(DEFAULT_LABEL_LAYOUT));
