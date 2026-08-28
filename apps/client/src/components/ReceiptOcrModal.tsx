import React, { useState } from 'react';
import { Camera, Sparkles, CheckCircle, FileText, Upload, RefreshCw } from 'lucide-react';

interface ReceiptOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (parsedData: any) => void;
}

export const ReceiptOcrModal: React.FC<ReceiptOcrModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
}) => {
  if (!isOpen) return null;

  const [scanning, setScanning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'restaurant' | 'flight' | 'grocery'>('restaurant');

  const handleScan = async (preset: string) => {
    setScanning(true);
    try {
      const response = await fetch('/api/ocr/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageName: preset }),
      });
      const data = await response.json();
      setTimeout(() => {
        setScanning(false);
        onReceiptScanned(data);
        onClose();
      }, 1200); // realistic OCR processing delay
    } catch (err) {
      setScanning(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal w-full max-w-md rounded-2xl p-6 border border-purple-500/30 shadow-glow-purple relative text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto mb-4">
          <Camera className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Receipt OCR Scanner</h3>
        <p className="text-xs text-slate-400 mb-6">
          AI vision parses total spend, vendor name, category, and itemized lines automatically
        </p>

        {scanning ? (
          <div className="py-10 space-y-4">
            <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
            <div className="text-sm font-semibold text-purple-300">Extracting receipt metadata...</div>
            <p className="text-xs text-slate-400">Running Tesseract text-extraction model</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-left text-xs font-semibold text-slate-300 mb-2">Select Sample Receipt Image:</div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPreset('restaurant')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPreset === 'restaurant'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-lg mb-1">🍷</div>
                <div className="text-xs font-bold">Bistro Dinner</div>
                <div className="text-[10px] text-slate-400">€142.50</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreset('flight')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPreset === 'flight'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-lg mb-1">✈️</div>
                <div className="text-xs font-bold">Air Ticket</div>
                <div className="text-[10px] text-slate-400">€480.00</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreset('grocery')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPreset === 'grocery'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-lg mb-1">🛒</div>
                <div className="text-xs font-bold">Supermarket</div>
                <div className="text-[10px] text-slate-400">€89.20</div>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-dashed border-purple-500/30 text-center">
              <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-xs text-slate-300 font-medium">Or snap/drag a receipt file here</div>
              <div className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 10MB)</div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleScan(selectedPreset)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-glow-purple flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Run OCR Scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
