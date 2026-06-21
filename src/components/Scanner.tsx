import React, { useState, useRef, useEffect } from 'react';

interface MockResponse {
  item: string;
  origin: string;
  transit_distance_km: number;
  co2e_footprint_kg: number;
  equivalent_driving_miles: number;
  carbon_rating: string;
  sustainable_alternatives: {
    name: string;
    co2e_footprint_kg: number;
    reduction_pct: number;
  }[];
}

const mockAuditResponse: MockResponse = {
  item: "Organic Avocado (Pack of 3)",
  origin: "Michoacán, Mexico",
  transit_distance_km: 3450,
  co2e_footprint_kg: 0.85,
  equivalent_driving_miles: 2.1,
  carbon_rating: "B-",
  sustainable_alternatives: [
    {
      name: "Local Seasonal Produce (Berries & Apples)",
      co2e_footprint_kg: 0.22,
      reduction_pct: 74.1
    },
    {
      name: "Fair-trade Greenhouse Avocados (Regional)",
      co2e_footprint_kg: 0.48,
      reduction_pct: 43.5
    }
  ]
};

export const Scanner: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MockResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setResult(null);
      setCapturedImage(null);
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Unable to access camera. Please check permissions or drag and drop an image instead.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
        triggerAudit();
      }
    }
  };

  // Simulate AI Auditing
  const triggerAudit = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      setResult(mockAuditResponse);
    }, 2500); // 2.5 seconds loading state
  };

  // File Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result as string);
        stopCamera();
        triggerAudit();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] pt-24 px-4 sm:px-6 lg:px-8 text-white flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-outfit font-bold text-emerald-400">GreenLens AI Scanner</h1>
          <p className="text-gray-400 mt-2">Scan receipts, barcodes, or food items to audit their carbon footprints instantly.</p>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Inputs Section */}
          <div className="space-y-6 bg-black/35 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-outfit font-semibold mb-4 text-emerald-350">Capture or Upload</h2>

            {/* Video Viewport / Preview */}
            <div className="relative aspect-video w-full bg-black/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
              {isCameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {capturedImage && !isCameraActive && (
                <img
                  src={capturedImage}
                  alt="Captured Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {!isCameraActive && !capturedImage && (
                <div className="text-gray-500 text-sm text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                  Camera is inactive
                </div>
              )}
            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Camera Actions */}
            <div className="flex gap-4">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Start Camera
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Capture Frame
                  </button>
                  <button
                    onClick={stopCamera}
                    className="py-3 px-5 bg-red-650 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all border border-red-500/20"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-widest font-semibold">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-emerald-400 bg-emerald-500/5'
                  : 'border-white/10 hover:border-white/20 bg-black/10'
              }`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm font-semibold text-gray-300">Drag & drop your receipt or product image</p>
              <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, or WEBP up to 5MB</p>
            </div>
          </div>

          {/* Output / Results Section */}
          <div className="space-y-6 bg-black/35 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-h-[350px] flex flex-col justify-center">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
                <p className="text-gray-400 text-sm animate-pulse font-outfit">AI is analyzing carbon footprint parameters...</p>
              </div>
            )}

            {!loading && !result && (
              <div className="text-center text-gray-500 py-12">
                <svg className="mx-auto h-12 w-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                </svg>
                <p className="text-sm">Audit results will be rendered here after image input capture.</p>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">Audit Completed</span>
                      <h3 className="text-2xl font-outfit font-bold mt-1 text-white">{result.item}</h3>
                    </div>
                    <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-lg">
                      {result.carbon_rating}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-semibold">CO2e Emissions</p>
                    <p className="text-xl font-bold mt-1 text-emerald-350">{result.co2e_footprint_kg} kg</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Equivalent Drive</p>
                    <p className="text-xl font-bold mt-1 text-emerald-350">{result.equivalent_driving_miles} mi</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Origin Point</p>
                    <p className="text-sm font-semibold mt-2 truncate text-white">{result.origin}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Transit Distance</p>
                    <p className="text-sm font-semibold mt-2 text-white">{result.transit_distance_km} km</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Sustainable Alternatives</h4>
                  <div className="space-y-3">
                    {result.sustainable_alternatives.map((alt, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl transition-all">
                        <div>
                          <p className="text-sm font-bold text-white">{alt.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Footprint: {alt.co2e_footprint_kg} kg CO2e</p>
                        </div>
                        <span className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg shadow-sm">
                          -{alt.reduction_pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
