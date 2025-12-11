
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, ArrowDownCircle, ArrowUpCircle, CheckCircle2, ScanBarcode, AlertTriangle } from 'lucide-react';
import { identifyProductFromImage } from '../services/geminiService';

interface ScannerProps {
  onClose: () => void;
  onScan: (productName: string, mode: 'IN' | 'OUT') => void;
  verificationMode?: boolean;
  targetName?: string;
}

export const Scanner: React.FC<ScannerProps> = ({ onClose, onScan, verificationMode = false, targetName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanMode, setScanMode] = useState<'IN' | 'OUT'>('OUT'); // Default to 'Using up' (Out)
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndIdentify = async () => {
    if (!videoRef.current || !canvasRef.current || analyzing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
      
      setAnalyzing(true);
      // We do NOT stop camera here to allow continuous scanning
      
      const productName = await identifyProductFromImage(base64);
      
      if (productName) {
        onScan(productName, scanMode);
        
        // Only show internal success feedback if NOT in verification mode
        // In verification mode, the parent component handles success/fail logic/alerts
        if (!verificationMode) {
          setLastScanned(productName);
          setTimeout(() => setLastScanned(null), 3000);
        }
      } else {
        alert("Could not identify product. Try moving closer or better lighting.");
      }
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 flex justify-between items-center text-white bg-black/60 absolute top-0 w-full z-10 backdrop-blur-sm">
        <div>
           <h3 className="font-semibold text-lg">{verificationMode ? 'Verify Item' : 'Point of Use Scanner'}</h3>
           <p className="text-xs text-slate-300">
             {verificationMode ? 'Ensure you have the correct item' : 'Scan items to update inventory instantly'}
           </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover ${analyzing ? 'opacity-50' : 'opacity-100'} transition-opacity`} 
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Verification Target Overlay */}
        {verificationMode && targetName && !analyzing && (
           <div className="absolute top-24 inset-x-4 bg-indigo-600/90 backdrop-blur text-white p-4 rounded-xl shadow-lg border border-indigo-400 z-20 text-center animate-bounce">
              <p className="text-xs uppercase font-bold tracking-wider opacity-80">Looking for match</p>
              <p className="text-xl font-bold">{targetName}</p>
           </div>
        )}

        {/* Reticle */}
        {!analyzing && !lastScanned && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`w-72 h-72 border-2 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] ${verificationMode ? 'border-indigo-400' : 'border-white/50'}`}>
               {!verificationMode && (
                 <>
                   <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 -mt-1 -ml-1 transition-colors ${scanMode === 'IN' ? 'border-green-500' : 'border-red-500'}`}></div>
                   <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 -mt-1 -mr-1 transition-colors ${scanMode === 'IN' ? 'border-green-500' : 'border-red-500'}`}></div>
                   <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 -mb-1 -ml-1 transition-colors ${scanMode === 'IN' ? 'border-green-500' : 'border-red-500'}`}></div>
                   <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 -mb-1 -mr-1 transition-colors ${scanMode === 'IN' ? 'border-green-500' : 'border-red-500'}`}></div>
                 </>
               )}
               {verificationMode && (
                 <>
                   <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 -mt-1 -ml-1 border-indigo-500"></div>
                   <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 -mt-1 -mr-1 border-indigo-500"></div>
                   <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 -mb-1 -ml-1 border-indigo-500"></div>
                   <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 -mb-1 -mr-1 border-indigo-500"></div>
                 </>
               )}
            </div>
            <p className="absolute mt-80 text-white/80 font-medium text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
               Tap button to capture
            </p>
          </div>
        )}
        
        {/* Loading State */}
        {analyzing && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-white flex flex-col items-center">
               <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-xl font-bold tracking-wide">Identifying...</p>
            </div>
          </div>
        )}

        {/* Success Feedback Overlay (Inventory Mode Only) */}
        {lastScanned && !verificationMode && (
           <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-xs mx-4">
                 <CheckCircle2 size={48} className={scanMode === 'IN' ? 'text-green-500' : 'text-red-500'} />
                 <h4 className="text-lg font-bold text-slate-900 mt-2 mb-1">{lastScanned}</h4>
                 <p className="text-sm text-slate-500">
                    {scanMode === 'IN' ? 'Restocked to 100%' : 'Added to Shopping List'}
                 </p>
              </div>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-6 py-8 pb-12 flex flex-col gap-6">
         {/* Mode Toggle - Hide in Verification Mode */}
         {!verificationMode && (
           <div className="flex bg-slate-800 p-1 rounded-xl mx-auto w-full max-w-sm">
              <button 
                 onClick={() => setScanMode('IN')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    scanMode === 'IN' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                 }`}
              >
                 <ArrowDownCircle size={20} /> Restock (In)
              </button>
              <button 
                 onClick={() => setScanMode('OUT')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    scanMode === 'OUT' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                 }`}
              >
                 <ArrowUpCircle size={20} /> Deplete (Out)
              </button>
           </div>
         )}

         {/* Capture Button */}
         <div className="flex justify-center">
            <button 
               onClick={captureAndIdentify}
               disabled={analyzing}
               className={`w-20 h-20 rounded-full border-4 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg ${
                  analyzing 
                     ? 'bg-slate-700 border-slate-600' 
                     : verificationMode
                        ? 'bg-indigo-600 border-indigo-300 ring-4 ring-indigo-900/50'
                        : scanMode === 'IN' 
                           ? 'bg-green-600 border-green-300 ring-4 ring-green-900/50' 
                           : 'bg-red-600 border-red-300 ring-4 ring-red-900/50'
               }`}
            >
               {verificationMode ? <ScanBarcode className="text-white" size={32} /> : <Camera className="text-white" size={32} />}
            </button>
         </div>
      </div>
    </div>
  );
};
