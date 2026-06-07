
import React, { useState, useEffect, useRef } from 'react';
import { LabelForm } from './components/LabelForm';
import { LabelPreview } from './components/LabelPreview';
import { LabelDesignerPanel } from './components/LabelDesignerPanel';
import { LogPanel } from './components/LogPanel';
import { LabelData, LabelElement, LabelElementKind, LabelLayout, LabelSize, LogEntry, SerialDevice, PrinterType } from './types';
import { generateTSPL } from './utils/tspl';
import { cloneDefaultLayout } from './utils/labelLayout';
import html2canvas from 'html2canvas';

// Helper to generate unique ID
const uuid = () => Math.random().toString(36).substring(2, 9);
const LAYOUT_STORAGE_KEY = 'industrial-label-layout-v1';

// MOCK DATABASE
const MOCK_DB: Record<string, Partial<LabelData>> = {
  '04515000010732': {
    receiverName: 'پیمان معینی',
    receiverCity: 'استان زنجان - شهر خرمدره',
    receiverAddress: 'شهرک گلدشت، خیابان پروین اعتصامی، انتهای خیابان مروارید، نبش کوچه نگین 3، پلاک 1، واحد 1',
    receiverPostCode: '4571310004',
    receiverPhone: '02435520000',
    receiverMobile: '09100277226',
    weight: '205',
    price: 'طبق توافق پرداخت شده',
    orderId: '200-40236801',
    date: '1404-04-22',
    time: '13:30:05',
    senderName: 'شرکت بازاریابان ایرانیان زمین (BIZ)',
    senderAddress: 'تهران، کد پستی: 1577646813 ، تلفن پشتیبانی: 43072-021',
  },
  '11112222333344': {
    receiverName: 'سارا رضایی',
    receiverCity: 'تهران',
    receiverAddress: 'میدان آزادی، خیابان آزادی، کوچه بانک، پلاک 5',
    receiverPostCode: '1345678901',
    receiverPhone: '02166000000',
    receiverMobile: '09120000000',
    weight: '500',
    price: 'پرداخت در محل',
    orderId: '200-99999999',
    date: '1404-05-10',
    time: '09:15:00',
    senderName: 'فروشگاه مرکزی',
    senderAddress: 'تهران، بازار بزرگ',
  }
};

function App() {
  // --- State ---
  const [labelData, setLabelData] = useState<LabelData>({
    trackingNumber: '',
    orderId: '',
    senderName: '',
    senderCity: '',
    senderAddress: '',
    receiverName: '',
    receiverCity: '',
    receiverAddress: '',
    receiverPostCode: '',
    receiverPhone: '',
    receiverMobile: '',
    weight: '', 
    packageSize: '', 
    price: '',
    paymentMethod: '',
    date: '',
    time: '',
    barcode: '',
    qrData: '',
    customNote: ''
  });
  
  const [labelSize, setLabelSize] = useState<LabelSize>(LabelSize.SIZE_100_100);
  const [labelLayout, setLabelLayout] = useState<LabelLayout>(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : cloneDefaultLayout();
    } catch {
      return cloneDefaultLayout();
    }
  });
  const [designerMode, setDesignerMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>('barcode');
  const [showDesignerGrid, setShowDesignerGrid] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Serial Port Management
  const [authorizedPorts, setAuthorizedPorts] = useState<any[]>([]);
  const [selectedScalePortIdx, setSelectedScalePortIdx] = useState<number>(-1);
  const [selectedPrinterPortIdx, setSelectedPrinterPortIdx] = useState<number>(-1);

  // Set default baudRate to 19200 for scale
  const [scaleDevice, setScaleDevice] = useState<SerialDevice>({ port: null, status: 'disconnected', baudRate: 19200 });
  const [printerDevice, setPrinterDevice] = useState<SerialDevice>({ port: null, status: 'disconnected', baudRate: 9600 });
  const [printerType, setPrinterType] = useState<PrinterType>(PrinterType.SYSTEM);
  const [scaleReader, setScaleReader] = useState<ReadableStreamDefaultReader<string> | null>(null);

  const scaleReadableStreamClosedRef = useRef<Promise<void> | null>(null);

  // --- Logging Helper ---
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-99), { 
      id: uuid(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(labelLayout));
  }, [labelLayout]);

  const updateLayoutElement = (id: string, updates: Partial<LabelElement>) => {
    setLabelLayout(prev => ({
      ...prev,
      elements: prev.elements.map(element => (
        element.id === id ? { ...element, ...updates } : element
      )),
    }));
  };

  const updateLabelLayout = (updates: Partial<LabelLayout>) => {
    setLabelLayout(prev => ({ ...prev, ...updates }));
  };

  const addLabelElement = (kind: LabelElementKind) => {
    const id = `${kind}-${uuid()}`;
    const baseElement: LabelElement = {
      id,
      label: `New ${kind}`,
      kind,
      x: 38,
      y: 38,
      w: kind === 'line' ? 24 : kind === 'qr' || kind === 'image' || kind === 'logo' ? 16 : 28,
      h: kind === 'line' ? 0 : kind === 'barcode' ? 12 : kind === 'text' ? 8 : 16,
      fontSize: 11,
      visible: true,
      align: 'center',
      direction: 'rtl',
      rotation: 0,
      staticText: kind === 'text' ? 'متن جدید' : undefined,
      field: kind === 'barcode' ? 'barcode' : kind === 'qr' ? 'qrData' : undefined,
      border: kind === 'box' || kind === 'line',
      background: kind === 'box' ? '#ffffff' : undefined,
    };

    setLabelLayout(prev => ({ ...prev, elements: [...prev.elements, baseElement] }));
    setSelectedElementId(id);
    addLog(`Added ${kind} element to label designer.`, 'success');
  };

  const deleteLabelElement = (id: string) => {
    setLabelLayout(prev => {
      const elements = prev.elements.filter(element => element.id !== id);
      setSelectedElementId(elements[0]?.id || null);
      return { ...prev, elements };
    });
    addLog('Removed label designer element.', 'warning');
  };

  const resetLabelLayout = () => {
    setLabelLayout(cloneDefaultLayout());
    setSelectedElementId('barcode');
    addLog('Label designer reset to default layout.', 'warning');
  };

  // --- Startup & Port Detection ---
  useEffect(() => {
    const updatePorts = async () => {
      if (navigator.serial) {
        try {
          const ports = await navigator.serial.getPorts();
          setAuthorizedPorts(ports);
          addLog(`System: Found ${ports.length} authorized device(s).`, 'info');
          
          // Auto-select first port if available and nothing selected
          if (ports.length > 0) {
            if (selectedScalePortIdx === -1) setSelectedScalePortIdx(0);
            if (selectedPrinterPortIdx === -1) setSelectedPrinterPortIdx(0);
          }
        } catch (e) {
          console.error("Serial detection error", e);
        }
      } else {
        addLog("Web Serial API not supported.", 'warning');
      }
    };

    updatePorts();

    // Listen for connect/disconnect events
    if (navigator.serial) {
      navigator.serial.addEventListener('connect', updatePorts);
      navigator.serial.addEventListener('disconnect', updatePorts);
    }
    return () => {
      if (navigator.serial) {
        navigator.serial.removeEventListener('connect', updatePorts);
        navigator.serial.removeEventListener('disconnect', updatePorts);
      }
    };
  }, []);

  // --- Helper: Request New Port ---
  const requestNewPort = async () => {
    if (!navigator.serial) return;
    try {
      addLog("Scanning for new devices...", 'info');
      await navigator.serial.requestPort();
      // The 'connect' event listener will update the list automatically
    } catch (e: any) {
      if (e.name !== 'NotFoundError') { // Ignore cancellation
        addLog(`Scan Error: ${e.message}`, 'error');
      }
    }
  };

  // --- Scale Logic ---
  const connectScale = async () => {
    if (!navigator.serial) return;

    // Use selected port from dropdown or fall back to requestPort
    let port = authorizedPorts[selectedScalePortIdx];
    
    if (!port) {
      addLog("No port selected. Please select a port or scan for devices.", 'warning');
      return;
    }

    try {
      // Check if port looks already open (basic check)
      if (port.readable) {
         addLog("Port appears to be open already. Reusing...", 'warning');
      } else {
         addLog(`Opening Scale Port (${scaleDevice.baudRate})...`, 'info');
         await port.open({ baudRate: scaleDevice.baudRate });
      }

      setScaleDevice(prev => ({ ...prev, port, status: 'connected' }));
      addLog("Scale Connected!", 'success');
      
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable!.pipeTo(textDecoder.writable);
      scaleReadableStreamClosedRef.current = readableStreamClosed;

      const reader = textDecoder.readable.getReader();
      setScaleReader(reader);

      readScaleData(reader);
    } catch (err: any) {
      addLog(`Scale Connection Failed: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const readScaleData = async (reader: ReadableStreamDefaultReader<string>) => {
    let buffer = "";
    let flushTimeout: any = null;

    const processLine = (line: string) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      addLog(`Parsing: [${cleanLine}]`, 'info');
      const weightRegex = /([+-])?\s*(\d+(?:\.\d+)?)\s*(kg|g|lb|oz)?/gi;
      const matches = [...cleanLine.matchAll(weightRegex)];
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const sign = match[1] || '+';
        const numberStr = match[2];
        const unit = match[3] ? match[3].toLowerCase() : '';
        let val = parseFloat(numberStr);
        if (sign === '-') val = -val;
        if (!isNaN(val) && val > 0) { 
           if (unit === 'kg') val = val * 1000;
           else if (unit === 'lb') val = val * 453.592;
           else if (unit === 'oz') val = val * 28.3495;
           const weightInt = Math.round(val);
           setLabelData(prev => {
              if (prev.weight !== weightInt.toString()) {
                  addLog(`>> WEIGHT UPDATE: ${weightInt}g`, 'success');
                  return { ...prev, weight: weightInt.toString() };
              }
              return prev;
           });
           break; 
        }
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          if (flushTimeout) clearTimeout(flushTimeout);
          const safeRaw = value.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
          addLog(`RX: ${safeRaw}`, 'data');
          buffer += value;
          if (buffer.length > 2000) buffer = buffer.slice(-2000);
          let parts = buffer.split(/\r\n|\r|\n/);
          buffer = parts.pop() || "";
          for (const line of parts) processLine(line);
          flushTimeout = setTimeout(() => {
             if (buffer.trim()) {
                addLog(`Buffer Flush: "${buffer.replace(/\r/g, '\\r')}"`, 'warning');
                processLine(buffer);
                buffer = "";
             }
          }, 100);
        }
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Scale Error: ${err.message}`, 'error');
    } finally {
      if (flushTimeout) clearTimeout(flushTimeout);
      reader.releaseLock();
    }
  };

  const disconnectScale = async () => {
    if (scaleReader) {
      try { await scaleReader.cancel(); } catch (e) { console.warn("Error canceling reader", e); }
      setScaleReader(null);
    }
    if (scaleReadableStreamClosedRef.current) {
      try { await scaleReadableStreamClosedRef.current; } catch (e) {}
      scaleReadableStreamClosedRef.current = null;
    }
    if (scaleDevice.port) {
      try {
        await scaleDevice.port.close();
        addLog("Scale Disconnected", 'info');
      } catch (e: any) {
        addLog(`Error closing port: ${e.message}`, 'error');
      }
      setScaleDevice(prev => ({ ...prev, port: null, status: 'disconnected' }));
    }
  };

  // --- Printer Logic ---
  const connectPrinter = async () => {
     if (!navigator.serial) return;
     
     let port = authorizedPorts[selectedPrinterPortIdx];
     if (!port) {
       addLog("No printer port selected.", 'warning');
       return;
     }

     try {
       if (port.readable) {
         addLog("Printer Port already open. Reusing...", 'warning');
       } else {
         addLog(`Opening Printer Port (9600)...`, 'info');
         await port.open({ baudRate: 9600 });
       }
       setPrinterDevice({ port, status: 'connected', baudRate: 9600 });
       addLog("TSPL Printer Connected", 'success');
     } catch (err: any) {
       addLog(`Printer Connection Failed: ${err.message}`, 'error');
     }
  };

  const validateForm = (): boolean => {
    if (!labelData.trackingNumber.trim()) {
      addLog("Validation Error: Tracking Number is required.", 'error');
      return false;
    }
    return true;
  };

  const printLabel = async () => {
    if (!validateForm()) return;

    if (printerType === PrinterType.SYSTEM) {
      addLog("Initiating System Print...", 'info');
      window.print();
      addLog("Sent to System Spooler", 'success');
    } else {
      if (designerMode) {
        addLog("Serial TSPL print uses the fixed printer command layout. Designer layout applies to system print and image export.", 'warning');
      }
      if (!printerDevice.port || printerDevice.status !== 'connected') {
        addLog("Serial Printer not connected!", 'error');
        return;
      }
      try {
        const tspl = generateTSPL(labelData, labelSize);
        const encoder = new TextEncoder();
        const writer = printerDevice.port.writable!.getWriter();
        await writer.write(encoder.encode(tspl));
        writer.releaseLock();
        addLog("TSPL Command Sent", 'success');
      } catch (err: any) {
        addLog(`Print Failed: ${err.message}`, 'error');
      }
    }
  };

  const exportAsImage = async () => {
    if (!validateForm()) return;
    const element = document.getElementById('printable-label');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 3 });
      const link = document.createElement('a');
      link.download = `Label_${labelData.trackingNumber}.png`;
      link.href = canvas.toDataURL();
      link.click();
      addLog("Label exported as PNG", 'success');
    } catch (e) {
      addLog("Export failed", 'error');
    }
  };

  const handleSearch = (tracking: string) => {
    addLog(`Searching: ${tracking}`, 'info');
    const result = MOCK_DB[tracking.trim()];
    if (result) {
      setLabelData(prev => ({
        ...prev,
        ...result,
        barcode: tracking,
        qrData: `https://tracking.post.ir/?id=${tracking}`
      }));
      addLog("Data found!", 'success');
    } else {
      addLog("Not found in database.", 'warning');
    }
  };

  const getSizeLabel = (size: LabelSize) => {
    switch(size) {
      case LabelSize.SIZE_100_80: return '100 x 80 mm';
      case LabelSize.SIZE_100_100: return '100 x 100 mm';
      case LabelSize.SIZE_80_100: return '80 x 100 mm';
    }
  }

  // Helper to render port options
  const renderPortOptions = () => {
     if (authorizedPorts.length === 0) return <option value={-1}>No Ports Found</option>;
     return authorizedPorts.map((port, idx) => {
        const info = port.getInfo();
        const label = `Port ${idx + 1} (USB:${info.usbVendorId || '?'}/${info.usbProductId || '?'})`;
        return <option key={idx} value={idx}>{label}</option>;
     });
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* HEADER */}
      <header 
        className="h-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-md z-10"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        
        {/* Brand */}
        <div className="flex items-center gap-3 w-1/5 select-none">
           <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow flex items-center justify-center font-black text-slate-900 text-lg">A</div>
           <h1 className="font-bold text-xl tracking-tight text-slate-100">
             ARSH <span className="text-[#ff6f6a]">EXPRESS</span>
           </h1>
        </div>
        
        {/* Center Widgets */}
        <div 
          className="flex-1 flex items-center justify-center gap-4"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
           {/* Scan Button (For Electron) */}
           <button 
              onClick={requestNewPort}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-1.5 rounded-lg border border-slate-700"
              title="Scan/Authorize New Device"
           >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </button>

           {/* Scale Widget with Port Selection */}
           <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
             <div className={`w-2 h-2 rounded-full ${scaleDevice.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
             <span className="text-[10px] font-bold text-slate-400">SCALE</span>
             
             {/* Port Selector */}
             <select 
                className="bg-slate-900 text-[10px] text-slate-300 rounded border border-slate-700 max-w-[100px]"
                value={selectedScalePortIdx}
                onChange={e => setSelectedScalePortIdx(Number(e.target.value))}
                disabled={scaleDevice.status === 'connected'}
             >
                {renderPortOptions()}
             </select>

            {/* Baud Rate Selector - Default 19200 */}
             <select
                className="bg-slate-900 text-[10px] text-slate-300 rounded border border-slate-700 max-w-[60px]"
                value={scaleDevice.baudRate}
                onChange={e => setScaleDevice(prev => ({ ...prev, baudRate: Number(e.target.value) }))}
                disabled={scaleDevice.status === 'connected'}
             >
               {[1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200].map(r => (
                 <option key={r} value={r}>{r}</option>
               ))}
             </select>

             <button 
                onClick={scaleDevice.status === 'connected' ? disconnectScale : connectScale}
                className={`text-[9px] font-bold px-2 py-0.5 rounded border ${scaleDevice.status === 'connected' ? 'border-rose-500 text-rose-400' : 'border-slate-500 text-slate-400'}`}
             >
               {scaleDevice.status === 'connected' ? 'DISC' : 'CONN'}
             </button>
           </div>

           {/* Printer Widget with Port Selection */}
           <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
             <div className={`w-2 h-2 rounded-full ${printerDevice.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
             <select 
               value={printerType} 
               onChange={(e) => setPrinterType(e.target.value as PrinterType)}
               className="bg-transparent text-[10px] font-bold text-slate-400 outline-none"
             >
               <option value={PrinterType.SYSTEM} className="bg-slate-800">SYSTEM</option>
               <option value={PrinterType.SERIAL_TSPL} className="bg-slate-800">SERIAL</option>
             </select>
             
             {printerType === PrinterType.SERIAL_TSPL && (
                 <>
                   <select 
                      className="bg-slate-900 text-[10px] text-slate-300 rounded border border-slate-700 max-w-[100px]"
                      value={selectedPrinterPortIdx}
                      onChange={e => setSelectedPrinterPortIdx(Number(e.target.value))}
                      disabled={printerDevice.status === 'connected'}
                   >
                      {renderPortOptions()}
                   </select>
                   <button 
                    onClick={connectPrinter}
                    disabled={printerDevice.status === 'connected'}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border ${printerDevice.status === 'connected' ? 'border-emerald-500 text-emerald-400' : 'border-slate-500 text-slate-400'}`}
                   >
                     {printerDevice.status === 'connected' ? 'RDY' : 'CONN'}
                   </button>
                 </>
             )}
           </div>

           {/* Data/Size Widget */}
           <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 ml-2">
              <span className="text-[10px] font-bold text-slate-400">SIZE</span>
              <select 
                 value={labelSize}
                 onChange={(e) => setLabelSize(e.target.value as LabelSize)}
                 className="bg-transparent text-[10px] text-amber-500 font-bold font-mono outline-none"
              >
                  {[LabelSize.SIZE_100_100, LabelSize.SIZE_100_80, LabelSize.SIZE_80_100].map(size => (
                     <option key={size} value={size} className="bg-slate-800 text-slate-200">
                        {getSizeLabel(size)}
                     </option>
                  ))}
              </select>
           </div>

           <button
              onClick={() => {
                setDesignerMode(prev => !prev);
                addLog(`Designer mode ${designerMode ? 'disabled' : 'enabled'}.`, 'info');
              }}
              className={`text-[10px] font-bold px-3 py-2 rounded-lg border ${designerMode ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}`}
           >
             DESIGN
           </button>
        </div>

        <div className="w-1/5"></div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative">
        
        {/* Left Side: Preview (55%) */}
        <section className={`${designerMode ? 'col-span-12 md:col-span-5' : 'col-span-12 md:col-span-7'} bg-slate-950 relative flex flex-col border-r border-slate-800/50`}>
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto z-0">
             <div className="bg-white p-4 shadow-2xl shadow-black/50 rounded-sm">
                <LabelPreview
                  data={labelData}
                  size={labelSize}
                  layout={labelLayout}
                  designerMode={designerMode}
                  selectedElementId={selectedElementId}
                  showGrid={showDesignerGrid}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={updateLayoutElement}
                />
             </div>
          </div>
          <div className="p-6 flex justify-center gap-4 bg-slate-900/80 backdrop-blur border-t border-slate-800 z-10">
             <button onClick={printLabel} disabled={!labelData.trackingNumber} className="group relative bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 pl-6 pr-8 rounded-lg shadow-lg flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden">
               <span className="tracking-wide">PRINT LABEL</span>
             </button>
             <button onClick={exportAsImage} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-lg border border-slate-700 shadow flex items-center gap-2 transition-all">
               SAVE IMAGE
             </button>
          </div>
        </section>

        {designerMode && (
          <section className="hidden md:block md:col-span-3 bg-slate-900 h-full overflow-hidden z-10">
            <LabelDesignerPanel
              layout={labelLayout}
              selectedElementId={selectedElementId}
              showGrid={showDesignerGrid}
              onSelectElement={setSelectedElementId}
              onAddElement={addLabelElement}
              onDeleteElement={deleteLabelElement}
              onUpdateElement={updateLayoutElement}
              onUpdateLayout={updateLabelLayout}
              onToggleGrid={() => setShowDesignerGrid(prev => !prev)}
              onReset={resetLabelLayout}
            />
          </section>
        )}

        {/* Right Side: Form & Logs (45%) */}
        <section className={`col-span-12 ${designerMode ? 'md:col-span-4' : 'md:col-span-5'} bg-slate-900 flex flex-col h-full overflow-hidden border-l border-slate-800 shadow-2xl z-10`}>
          <div className="flex-1 overflow-hidden relative">
             <LabelForm data={labelData} onChange={setLabelData} onSearch={handleSearch} onLog={addLog} />
          </div>
          <div className="h-40 shrink-0 border-t border-slate-800">
             <LogPanel logs={logs} onClear={() => setLogs([])} />
          </div>
        </section>

      </main>
      <div id="printable-area" className="hidden print:flex">
         <LabelPreview data={labelData} size={labelSize} layout={labelLayout} />
      </div>
    </div>
  );
}

export default App;
