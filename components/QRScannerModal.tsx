
import React, { useRef, useEffect, useState } from 'react';
import { XIcon } from './icons';

interface QRScannerModalProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | undefined;
    
    const openCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Simulate scanning after 3 seconds for demo purposes
        const timeoutId = setTimeout(() => {
            onScan('harvesthub-pay@okhdfcbank');
            onClose();
        }, 3000);
        
        return () => clearTimeout(timeoutId);

      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions in your browser settings.");
      }
    };

    openCamera();

    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose, onScan]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[101] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col relative">
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Scan QR Code</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {error ? (
            <p className="text-red-500 text-center p-8">{error}</p>
          ) : (
            <div className="flex flex-col items-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg border" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 border-4 border-dashed border-white/50 rounded-lg"></div>
              <p className="text-center text-gray-600 mt-4 animate-pulse">Point your camera at a QR code...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;