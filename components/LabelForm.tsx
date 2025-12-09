
import React, { useState, useEffect, useRef } from 'react';
import { LabelData, LabelSize } from '../types';

interface LabelFormProps {
  data: LabelData;
  onChange: (data: LabelData) => void;
  onSearch: (tracking: string) => void;
  onLog: (msg: string, type: 'info' | 'error' | 'success' | 'warning') => void;
}

export const LabelForm: React.FC<LabelFormProps> = ({ 
  data, onChange, onSearch, onLog 
}) => {
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const trackingInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts for Package Size
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (except if body is focused or a non-input)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key >= '2' && e.key <= '9') {
        const size = `Size ${e.key}`;
        onChange({ ...data, packageSize: size });
        onLog(`Package Size set to ${size}`, 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, onChange, onLog]);

  const handleChange = (field: keyof LabelData, value: string) => {
    const updates: Partial<LabelData> = { [field]: value };
    // Auto-update barcode/QR when tracking number changes
    if (field === 'trackingNumber') {
      updates.barcode = value;
      updates.qrData = `https://tracking.post.ir/?id=${value}`;
    }
    onChange({ ...data, ...updates });
  };

  const handleSearchTrigger = () => {
    if (data.trackingNumber) {
      onSearch(data.trackingNumber);
      // Blur input to allow keyboard shortcuts (2-9) to work immediately
      trackingInputRef.current?.blur();
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchTrigger();
    }
  };

  return (
    <div className="bg-slate-900 h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
      
      {/* TRACKING CARD */}
      <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        <label className="block text-[10px] font-bold text-amber-500 mb-2 tracking-widest uppercase">Tracking Number / Barcode</label>
        <div className="flex gap-2">
          <input
              ref={trackingInputRef}
              type="text"
              value={data.trackingNumber}
              onChange={(e) => handleChange('trackingNumber', e.target.value)}
              onKeyDown={handleKeyDownInput}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-lg tracking-wider focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder-slate-700"
              placeholder="Scan or enter tracking..."
          />
          <button 
            onClick={handleSearchTrigger}
            className="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* SENDER CARD */}
      <div className="bg-slate-800/20 p-5 rounded-xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
           </svg>
           Sender (Ferestande)
        </h3>
        <div className="space-y-3">
            <input
              type="text"
              dir="rtl"
              placeholder="Sender Name"
              value={data.senderName}
              onChange={(e) => handleChange('senderName', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white font-farsi text-sm focus:border-slate-500 outline-none"
            />
            <textarea
              dir="rtl"
              placeholder="Sender Address"
              rows={2}
              value={data.senderAddress}
              onChange={(e) => handleChange('senderAddress', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white font-farsi text-xs focus:border-slate-500 outline-none resize-none"
            />
        </div>
      </div>

      {/* RECEIVER CARD */}
      <div className="bg-slate-800/20 p-5 rounded-xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
           </svg>
           Receiver (Girande) - <span className="text-amber-500 ml-1">READ ONLY</span>
        </h3>
        <div className="space-y-3 opacity-90">
            <div className="grid grid-cols-2 gap-3">
               <input
                 type="text"
                 dir="rtl"
                 readOnly
                 placeholder="Full Name"
                 value={data.receiverName}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-farsi text-sm cursor-not-allowed focus:outline-none"
               />
               <input
                 type="text"
                 dir="rtl"
                 readOnly
                 placeholder="City"
                 value={data.receiverCity}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-farsi text-sm cursor-not-allowed focus:outline-none"
               />
            </div>
            <textarea
              dir="rtl"
              readOnly
              placeholder="Address details..."
              rows={3}
              value={data.receiverAddress}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-farsi text-xs cursor-not-allowed resize-none focus:outline-none"
            />
            
            <div className="grid grid-cols-2 gap-3">
               <div className="relative">
                  <label className="absolute -top-1.5 right-2 bg-slate-900 px-1 text-[9px] text-slate-500">Post Code</label>
                  <input
                    type="text"
                    readOnly
                    value={data.receiverPostCode}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-mono text-sm cursor-not-allowed focus:outline-none"
                  />
               </div>
               <div className="relative">
                  <label className="absolute -top-1.5 right-2 bg-slate-900 px-1 text-[9px] text-slate-500">Order ID</label>
                  <input
                    type="text"
                    readOnly
                    value={data.orderId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-mono text-sm cursor-not-allowed focus:outline-none"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                readOnly
                placeholder="Phone"
                value={data.receiverPhone}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-mono text-sm cursor-not-allowed focus:outline-none"
              />
              <input
                type="text"
                readOnly
                placeholder="Mobile"
                value={data.receiverMobile}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-mono text-sm cursor-not-allowed focus:outline-none"
              />
            </div>
        </div>
      </div>

      {/* METRICS CARD */}
      <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 space-y-4">
           
           {/* Weight & Status Row */}
           <div className="grid grid-cols-2 gap-6">
              <div className="relative group">
                  <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    Weight (g)
                  </div>
                  <input
                    type="text"
                    value={data.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-emerald-400 font-bold font-mono text-xl focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all outline-none"
                  />
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase">
                    Status (Read Only)
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    readOnly
                    value={data.price}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 font-farsi text-sm focus:outline-none cursor-not-allowed"
                  />
              </div>
           </div>

           {/* Package Size Row */}
           <div className="relative">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Package Size
                 </div>
                 <span className="text-[9px] text-slate-500 font-mono border border-slate-700 px-1.5 py-0.5 rounded">Keys: 2-9</span>
              </div>
              <select
                 value={data.packageSize}
                 onChange={(e) => handleChange('packageSize', e.target.value)}
                 className="w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-blue-400 font-bold font-mono text-lg focus:border-blue-500 outline-none appearance-none"
              >
                 <option value="">Select Size...</option>
                 {[2,3,4,5,6,7,8,9].map(num => (
                    <option key={num} value={`Size ${num}`}>Size {num}</option>
                 ))}
              </select>
           </div>

      </div>

    </div>
  );
};
