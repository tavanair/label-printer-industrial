
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { LabelData, LabelSize } from '../types';

interface LabelPreviewProps {
  data: LabelData;
  size: LabelSize;
}

// Helper: Convert English digits to Persian
const toPersianDigits = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.toString().replace(/\d/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1728));
};

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, size }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  // Dimension Logic
  const is100x80 = size === LabelSize.SIZE_100_80;
  const is100x100 = size === LabelSize.SIZE_100_100;
  
  let containerClass = 'w-[80mm] h-[100mm]';
  if (is100x100) containerClass = 'w-[100mm] h-[100mm]';
  if (is100x80) containerClass = 'w-[100mm] h-[80mm]';
  
  // Update Barcode (Code 128) - Keeps standard digits for scanner compatibility
  useEffect(() => {
    if (barcodeRef.current && data.barcode) {
      try {
        JsBarcode(barcodeRef.current, data.barcode, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.8,
          height: 40,
          displayValue: true,
          fontSize: 14,
          fontOptions: "bold",
          margin: 0,
          textMargin: 2
        });
      } catch (e) {
        console.warn("Barcode generation failed", e);
      }
    }
  }, [data.barcode]);

  // Update QR Code
  useEffect(() => {
    if (qrRef.current && data.qrData) {
      QRCode.toCanvas(qrRef.current, data.qrData, {
        width: 55,
        margin: 0,
        errorCorrectionLevel: 'M',
      }, (error: any) => {
        if (error) console.warn("QR generation failed", error);
      });
    }
  }, [data.qrData]);

  return (
    <div className="flex flex-col items-center justify-center h-full select-none">
      
      {/* Label Container */}
      <div 
        id="printable-label"
        className={`${containerClass} bg-white text-black border-[1px] border-black relative overflow-hidden flex flex-row-reverse box-border font-farsi`}
        style={{ direction: 'rtl', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
      >
        
        {/* COLUMN A (Sidebar) - 1/4 Width */}
        <div className="w-[26%] h-full flex flex-col border-l-2 border-r-2 border-black items-center pt-2 shrink-0 justify-between bg-white overflow-hidden">
           
           <div className="flex flex-col items-center w-full shrink-0">
               {/* QR Code */}
               <canvas ref={qrRef} className="w-[14mm] h-[14mm] mb-0.5" />
               <div className="text-[8px] font-bold leading-none text-center">رهگیری در سایت</div>
               <div className="text-[6px] font-mono leading-none text-center mt-0.5 mb-2">tracking.post.ir</div>

               {/* Black Box */}
               <div className="bg-black text-white w-[90%] text-center py-1.5 mb-2">
                  <div className="font-bold text-[10px]">انبار مکانیزه</div>
               </div>
               
               {/* BIZ Link */}
               <div className="text-[11px] font-bold font-mono mb-2">bizmlm.ir</div>
           </div>

           {/* Bottom Section: Order ID and Date/Time */}
           <div className="w-full flex flex-col items-center justify-start flex-1 min-h-0 pt-2 pb-2">
               
               {/* Label: Order ID */}
               <div className="text-[10px] font-bold text-center w-full mb-2">شناسه سفارش</div>
               
               {/* Order ID Value (Vertical, Persian) */}
               <div 
                  className="font-farsi text-[16px] font-bold whitespace-nowrap" 
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
               >
                  {toPersianDigits(data.orderId)}
               </div>

               {/* Gap */}
               <div style={{ height: '12px', minHeight: '12px' }}></div>

               {/* Date & Time Value (Vertical, Persian) */}
               <div className="flex gap-1 items-center justify-center">
                   <div className="font-farsi text-[10px] font-bold" style={{ writingMode: 'vertical-rl' }}>{toPersianDigits(data.date)}</div>
                   <div className="font-farsi text-[10px] font-bold" style={{ writingMode: 'vertical-rl' }}>{toPersianDigits(data.time)}</div>
               </div>

           </div>
        </div>

        {/* COLUMN B (Main) - 3/4 Width */}
        <div className="w-[74%] h-full flex flex-col">
           
           {/* SECTION 1: Header (Row 1) */}
           <div className="flex h-[24mm] border-b-2 border-black shrink-0 items-center justify-between">
              
              {/* 1. Logo (Rightmost) */}
              <div className="w-[18mm] h-full flex flex-col items-center justify-center p-1 border-l-2 border-black">
                 <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20 40 L45 65 L80 20 L65 15 L45 50 L30 35 Z" fill="#FFC107" />
                    <path d="M45 65 L80 20 L85 25 L45 75 L15 45 L20 40 Z" fill="#FFC107" />
                    <path d="M20 80 H80 V88 H20 Z" fill="#1e3a8a" />
                    <path d="M30 90 H70 V94 H30 Z" fill="#1e3a8a" />
                 </svg>
              </div>

              {/* 2. Barcode */}
              <div className="flex-1 h-full flex flex-col items-center justify-center p-1 overflow-hidden">
                 <div className="text-[9px] font-bold mb-0.5">برچسب کد رهگیری و اعتبارسنجی 3PDL</div>
                 <div className="flex items-center justify-center w-full h-full transform scale-95 origin-center">
                    <svg ref={barcodeRef} className="max-w-full max-h-full"></svg>
                 </div>
              </div>

           </div>

           {/* SECTION 2: Sender */}
           <div className="h-[15mm] border-b-2 border-black p-1.5 px-3 flex flex-col justify-center shrink-0 bg-slate-50/50">
               <div className="text-[11px] truncate">
                  <span className="font-bold">فرستنده: </span>
                  <span>{data.senderName}</span>
               </div>
               <div className="text-[10px] mt-1 leading-tight line-clamp-2">
                  <span className="font-bold">آدرس: </span>
                  <span>{toPersianDigits(data.senderAddress)}</span>
               </div>
           </div>

           {/* SECTION 3: Receiver */}
           <div className="flex-1 p-1.5 px-3 border-b-2 border-black flex flex-col justify-center">
               <div className="text-[12px] mb-1">
                  <span className="font-bold">گیرنده: </span>
                  <span className="font-bold">{data.receiverCity}</span>
               </div>
               <div className="text-[11px] leading-snug">
                  {toPersianDigits(data.receiverAddress)}
               </div>
           </div>

           {/* SECTION 4: Grid Details */}
           <div className="h-[24mm] grid grid-cols-2 text-[11px] shrink-0">
               
               {/* Col A */}
               <div className="border-l-2 border-black p-1 px-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-black pb-0.5 h-1/3">
                     <span className="font-bold truncate">{data.receiverName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-black py-0.5 h-1/3">
                     <span className="text-[10px]">تلفن</span>
                     <span className="font-farsi font-bold">{toPersianDigits(data.receiverPhone)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5 font-bold h-1/3">
                     <span className="text-[10px]">وزن</span>
                     <div className="flex items-baseline gap-1">
                        <span className="font-farsi text-lg">{toPersianDigits(data.weight)}</span>
                        <span className="text-[9px]">گرم</span>
                     </div>
                  </div>
               </div>

               {/* Col B */}
               <div className="p-1 px-2 flex flex-col justify-between">
                   <div className="flex justify-between items-center border-b border-black pb-0.5 h-1/3">
                     <span className="text-[10px]">کدپستی</span>
                     <span className="font-farsi font-bold tracking-wider">{toPersianDigits(data.receiverPostCode)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-black py-0.5 h-1/3">
                     <span className="text-[10px]">موبایل</span>
                     <span className="font-farsi font-bold">{toPersianDigits(data.receiverMobile)}</span>
                  </div>
                  <div className="text-[9px] text-center pt-1 font-bold h-1/3 flex items-center justify-center">
                     طبق توافق پرداخت شده
                  </div>
               </div>

           </div>
        </div>

      </div>
      
      {/* Footer Text with Dimensions and Package Size */}
      <div className="mt-3 text-slate-500 text-xs font-mono flex gap-2">
         <span>{containerClass.match(/w-\[(.*?)\]/)?.[1]} x {containerClass.match(/h-\[(.*?)\]/)?.[1]}</span>
         {data.packageSize && (
            <>
                <span>-</span>
                <span className="text-amber-500 font-bold font-farsi">{toPersianDigits(data.packageSize)}</span>
            </>
         )}
      </div>
    </div>
  );
};
