import React, { useState } from 'react';
import { LabelData, LabelElement, LabelElementKind, LabelLayout } from '../types';

interface LabelDesignerPanelProps {
  layout: LabelLayout;
  selectedElementId: string | null;
  showGrid: boolean;
  onSelectElement: (id: string) => void;
  onAddElement: (kind: LabelElementKind) => void;
  onDeleteElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<LabelElement>) => void;
  onUpdateLayout: (updates: Partial<LabelLayout>) => void;
  onToggleGrid: () => void;
  onReset: () => void;
}

const variableOptions: Array<{ value: keyof LabelData; label: string }> = [
  { value: 'trackingNumber', label: 'Tracking number' },
  { value: 'orderId', label: 'Order ID' },
  { value: 'senderName', label: 'Sender name' },
  { value: 'senderCity', label: 'Sender city' },
  { value: 'senderAddress', label: 'Sender address' },
  { value: 'receiverName', label: 'Receiver name' },
  { value: 'receiverCity', label: 'Receiver city' },
  { value: 'receiverAddress', label: 'Receiver address' },
  { value: 'receiverPostCode', label: 'Post code' },
  { value: 'receiverPhone', label: 'Phone' },
  { value: 'receiverMobile', label: 'Mobile' },
  { value: 'weight', label: 'Weight' },
  { value: 'packageSize', label: 'Package size' },
  { value: 'price', label: 'Price/status' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'barcode', label: 'Barcode value' },
  { value: 'qrData', label: 'QR data' },
  { value: 'customNote', label: 'Custom note' },
];

const addableKinds: Array<{ value: LabelElementKind; label: string }> = [
  { value: 'text', label: 'Text / Variable' },
  { value: 'barcode', label: 'Barcode' },
  { value: 'qr', label: 'QR code' },
  { value: 'image', label: 'Bitmap image' },
  { value: 'box', label: 'Box' },
  { value: 'line', label: 'Line' },
  { value: 'logo', label: 'Logo' },
];

const numberValue = (value: number) => Number(value.toFixed(2));

export const LabelDesignerPanel: React.FC<LabelDesignerPanelProps> = ({
  layout,
  selectedElementId,
  showGrid,
  onSelectElement,
  onAddElement,
  onDeleteElement,
  onUpdateElement,
  onUpdateLayout,
  onToggleGrid,
  onReset,
}) => {
  const [newKind, setNewKind] = useState<LabelElementKind>('text');
  const selected = layout.elements.find(element => element.id === selectedElementId) || layout.elements[0];

  const updateNumber = (field: keyof Pick<LabelElement, 'x' | 'y' | 'w' | 'h' | 'fontSize'>, value: string) => {
    if (!selected) return;
    onUpdateElement(selected.id, { [field]: Number(value) } as Partial<LabelElement>);
  };

  const uploadImage = (file: File | undefined) => {
    if (!selected || !file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateElement(selected.id, {
        kind: 'image',
        staticText: String(reader.result || ''),
        label: selected.label === 'New image' ? file.name : selected.label,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="h-full bg-slate-900 border-l border-slate-800 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-100 uppercase tracking-wide">Label Designer</div>
          <div className="text-[10px] text-slate-500 font-mono">add, bind, drag, rotate</div>
        </div>
        <button onClick={onReset} className="text-[10px] font-bold px-2 py-1 rounded border border-rose-500/40 text-rose-300 hover:bg-rose-500/10">
          RESET
        </button>
      </div>

      <div className="p-3 border-b border-slate-800 space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <select
            value={newKind}
            onChange={(event) => setNewKind(event.target.value as LabelElementKind)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-2 text-xs text-slate-100 outline-none"
          >
            {addableKinds.map(kind => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
          </select>
          <button
            onClick={() => onAddElement(newKind)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 rounded"
          >
            ADD
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onToggleGrid}
            className={`text-[10px] font-bold px-2 py-2 rounded border ${showGrid ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-700'}`}
          >
            GRID
          </button>
          <label className="col-span-2 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-400">
            Snap %
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={layout.gridSize}
              onChange={(event) => onUpdateLayout({ gridSize: Number(event.target.value) })}
              className="w-full bg-transparent text-slate-100 font-mono outline-none"
            />
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 grid grid-rows-2">
        <div className="overflow-y-auto border-b border-slate-800">
          {layout.elements.map((element) => (
            <button
              key={element.id}
              onClick={() => onSelectElement(element.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left border-b border-slate-800/70 ${selected?.id === element.id ? 'bg-amber-500/10 text-amber-200' : 'text-slate-400 hover:bg-slate-800/70'}`}
            >
              <span className="text-xs truncate">{element.label}</span>
              <span className="text-[9px] font-mono uppercase text-slate-500">{element.kind}</span>
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {selected && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <input
                    value={selected.label}
                    onChange={(event) => onUpdateElement(selected.id, { label: event.target.value })}
                    className="w-full bg-transparent text-sm font-bold text-slate-100 outline-none border-b border-slate-700 focus:border-amber-500"
                  />
                  <div className="text-[10px] text-slate-500 font-mono truncate">{selected.id}</div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={selected.visible}
                    onChange={(event) => onUpdateElement(selected.id, { visible: event.target.checked })}
                    className="accent-amber-500"
                  />
                  Visible
                </label>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(['x', 'y', 'w', 'h'] as const).map((field) => (
                  <label key={field} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] uppercase text-slate-500">
                    {field}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={numberValue(selected[field])}
                      onChange={(event) => updateNumber(field, event.target.value)}
                      className="w-full bg-transparent text-slate-100 font-mono outline-none"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {([0, 90, 180, 270] as const).map(rotation => (
                  <button
                    key={rotation}
                    onClick={() => onUpdateElement(selected.id, { rotation })}
                    className={`text-[10px] px-2 py-2 rounded border ${Number(selected.rotation || 0) === rotation ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-700'}`}
                  >
                    {rotation}
                  </button>
                ))}
              </div>

              {['text', 'barcode', 'qr'].includes(selected.kind) && (
                <div className="space-y-2">
                  <label className="block bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-500">
                    Variable
                    <select
                      value={selected.field || ''}
                      onChange={(event) => onUpdateElement(selected.id, { field: event.target.value ? event.target.value as keyof LabelData : undefined })}
                      className="w-full bg-transparent text-slate-100 text-xs outline-none"
                    >
                      <option value="">Static value</option>
                      {variableOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>

                  <label className="block bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-500">
                    Static text
                    <textarea
                      value={selected.staticText || ''}
                      disabled={Boolean(selected.field)}
                      onChange={(event) => onUpdateElement(selected.id, { staticText: event.target.value })}
                      className="w-full bg-transparent text-slate-100 text-xs outline-none resize-none disabled:opacity-40"
                      rows={2}
                    />
                  </label>
                </div>
              )}

              {selected.kind === 'image' && (
                <label className="block bg-slate-950 border border-slate-700 rounded px-2 py-2 text-[10px] text-slate-500">
                  Bitmap image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/bmp"
                    onChange={(event) => uploadImage(event.target.files?.[0])}
                    className="mt-2 block w-full text-xs text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-amber-500 file:px-2 file:py-1 file:text-xs file:font-bold file:text-slate-950"
                  />
                </label>
              )}

              {selected.kind === 'text' && (
                <>
                  <label className="block bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-500">
                    Font size
                    <input
                      type="range"
                      min={5}
                      max={28}
                      step={1}
                      value={selected.fontSize}
                      onChange={(event) => updateNumber('fontSize', event.target.value)}
                      className="w-full accent-amber-500"
                    />
                    <span className="text-slate-200 font-mono">{selected.fontSize}px</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {(['right', 'center', 'left'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onUpdateElement(selected.id, { align })}
                        className={`text-[10px] px-2 py-2 rounded border uppercase ${selected.align === align ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-700'}`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateElement(selected.id, { bold: !selected.bold })}
                      className={`text-xs font-bold px-2 py-2 rounded border ${selected.bold ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-700'}`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => onUpdateElement(selected.id, { vertical: !selected.vertical })}
                      className={`text-[10px] font-bold px-2 py-2 rounded border ${selected.vertical ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-700'}`}
                    >
                      VERTICAL
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={() => onDeleteElement(selected.id)}
                className="w-full text-xs font-bold px-3 py-2 rounded border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
              >
                DELETE ELEMENT
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
