import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { LabelData, LabelElement, LabelLayout, LabelSize } from '../types';

interface LabelPreviewProps {
  data: LabelData;
  size: LabelSize;
  layout: LabelLayout;
  designerMode?: boolean;
  selectedElementId?: string | null;
  showGrid?: boolean;
  onSelectElement?: (id: string) => void;
  onUpdateElement?: (id: string, updates: Partial<LabelElement>) => void;
}

const toPersianDigits = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.toString().replace(/\d/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1728));
};

const getSizeMeta = (size: LabelSize) => {
  if (size === LabelSize.SIZE_100_80) return { widthMm: 100, heightMm: 80, className: 'w-[100mm] h-[80mm]' };
  if (size === LabelSize.SIZE_100_100) return { widthMm: 100, heightMm: 100, className: 'w-[100mm] h-[100mm]' };
  return { widthMm: 80, heightMm: 100, className: 'w-[80mm] h-[100mm]' };
};

const getElementText = (element: LabelElement, data: LabelData) => {
  const rawValue = element.field ? data[element.field] : element.staticText;
  const value = toPersianDigits(rawValue || '');
  return `${element.prefix || ''}${value}${element.suffix || ''}`;
};

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  data,
  size,
  layout,
  designerMode = false,
  selectedElementId,
  showGrid = false,
  onSelectElement,
  onUpdateElement,
}) => {
  const barcodeRefs = useRef<Record<string, SVGSVGElement | null>>({});
  const qrRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const { widthMm, heightMm, className } = getSizeMeta(size);

  useEffect(() => {
    layout.elements.forEach((element) => {
      if (element.kind !== 'barcode' || !element.visible) return;
      const node = barcodeRefs.current[element.id];
      const value = element.field ? data[element.field] : element.staticText;
      if (!node || !value) return;
      try {
        JsBarcode(node, String(value), {
          format: 'CODE128',
          lineColor: '#000',
          width: 1.6,
          height: 38,
          displayValue: true,
          fontSize: 13,
          fontOptions: 'bold',
          margin: 0,
          textMargin: 2,
        });
      } catch (e) {
        console.warn('Barcode generation failed', e);
      }
    });
  }, [data, layout.elements]);

  useEffect(() => {
    layout.elements.forEach((element) => {
      if (element.kind !== 'qr' || !element.visible) return;
      const node = qrRefs.current[element.id];
      const value = element.field ? data[element.field] : element.staticText;
      if (!node || !value) return;
      QRCode.toCanvas(node, String(value), {
        width: 180,
        margin: 0,
        errorCorrectionLevel: 'M',
      }, (error: any) => {
        if (error) console.warn('QR generation failed', error);
      });
    });
  }, [data, layout.elements]);

  const snap = (value: number) => {
    if (!designerMode || layout.gridSize <= 0) return value;
    return Math.round(value / layout.gridSize) * layout.gridSize;
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, element: LabelElement) => {
    if (!designerMode || !onUpdateElement) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectElement?.(element.id);

    const labelNode = event.currentTarget.closest('[data-label-canvas="true"]') as HTMLElement | null;
    if (!labelNode) return;
    const rect = labelNode.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const initial = { x: element.x, y: element.y };

    const handleMove = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      const nextX = Math.max(0, Math.min(100 - element.w, snap(initial.x + dx)));
      const nextY = Math.max(0, Math.min(100 - element.h, snap(initial.y + dy)));
      onUpdateElement(element.id, { x: Number(nextX.toFixed(2)), y: Number(nextY.toFixed(2)) });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const renderLogo = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M20 40 L45 65 L80 20 L65 15 L45 50 L30 35 Z" fill="#FFC107" />
      <path d="M45 65 L80 20 L85 25 L45 75 L15 45 L20 40 Z" fill="#FFC107" />
      <path d="M20 80 H80 V88 H20 Z" fill="#1e3a8a" />
      <path d="M30 90 H70 V94 H30 Z" fill="#1e3a8a" />
    </svg>
  );

  const renderElementContent = (element: LabelElement) => {
    if (element.kind === 'box' || element.kind === 'line') return null;
    if (element.kind === 'logo') return renderLogo();
    if (element.kind === 'barcode') {
      return <svg ref={(node) => { barcodeRefs.current[element.id] = node; }} className="max-w-full max-h-full" />;
    }
    if (element.kind === 'qr') {
      return <canvas ref={(node) => { qrRefs.current[element.id] = node; }} className="w-full h-full" />;
    }
    if (element.kind === 'image') {
      if (!element.staticText) {
        return designerMode ? <span className="text-[9px] text-slate-500">Upload image</span> : null;
      }
      return <img src={element.staticText} alt={element.label} className="w-full h-full object-contain" draggable={false} />;
    }
    return getElementText(element, data);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full select-none">
      <div
        id="printable-label"
        data-label-canvas="true"
        className={`${className} bg-white text-black relative overflow-hidden box-border font-farsi ${layout.showBorder ? 'border border-black' : ''}`}
        style={{
          direction: 'rtl',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
          backgroundImage: designerMode && showGrid
            ? 'linear-gradient(to right, rgba(245, 158, 11, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.2) 1px, transparent 1px)'
            : undefined,
          backgroundSize: designerMode && showGrid ? `${layout.gridSize}% ${layout.gridSize}%` : undefined,
        }}
      >
        {layout.elements.filter(element => element.visible).map((element) => {
          const selected = designerMode && selectedElementId === element.id;
          const isRule = element.kind === 'line';
          return (
            <div
              key={element.id}
              onPointerDown={(event) => startDrag(event, element)}
              onClick={(event) => {
                if (!designerMode) return;
                event.stopPropagation();
                onSelectElement?.(element.id);
              }}
              className={`absolute overflow-hidden ${designerMode ? 'cursor-move' : ''} ${selected ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-white' : ''}`}
              title={designerMode ? element.label : undefined}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.w}%`,
                height: `${element.h}%`,
                fontSize: `${element.fontSize}px`,
                fontWeight: element.bold ? 700 : 400,
                textAlign: element.align || 'right',
                direction: element.direction || 'rtl',
                writingMode: element.vertical ? 'vertical-rl' : undefined,
                textOrientation: element.vertical ? 'mixed' : undefined,
                color: element.color || '#000000',
                background: element.background || 'transparent',
                border: element.border && !isRule ? '1px solid #000000' : undefined,
                borderLeft: isRule && element.w === 0 ? '2px solid #000000' : undefined,
                borderTop: isRule && element.h === 0 ? '2px solid #000000' : undefined,
                display: 'flex',
                alignItems: element.kind === 'text' ? 'center' : 'center',
                justifyContent: element.align === 'center' ? 'center' : element.align === 'left' ? 'flex-start' : 'flex-end',
                padding: element.kind === 'text' ? '1mm' : 0,
                lineHeight: element.kind === 'text' ? 1.15 : 1,
                whiteSpace: element.vertical ? 'nowrap' : 'normal',
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                transformOrigin: 'center center',
              }}
            >
              {renderElementContent(element)}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-slate-500 text-xs font-mono flex gap-2 print:hidden">
        <span>{widthMm}mm x {heightMm}mm</span>
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
