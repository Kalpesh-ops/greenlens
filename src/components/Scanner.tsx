import React, { useState, useRef, useEffect } from 'react';

interface GeminiItem {
  name: string;
  co2e: number;
  alternative: string;
}

interface GeminiResponse {
  items: GeminiItem[];
  total_co2e: number;
}

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];

const cleanJsonText = (rawText: string): string => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  }
  return cleaned;
};

const auditCarbonFootprint = async (dataUrl: string): Promise<GeminiResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  // Parse mime type and strip prefix for raw base64
  const match = dataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = match ? match[1] : 'image/png';
  const base64Clean = dataUrl.replace(/^data:image\/\w+;base64,/, "");

  const prompt = "Analyze this image. Identify the primary items or activities shown. Estimate their carbon footprint (CO2e in kg) and suggest a simple, greener alternative. Return ONLY a valid JSON object with the following structure: { 'items': [ { 'name': string, 'co2e': number, 'alternative': string } ], 'total_co2e': number }.";

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Clean
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  let lastError: any = null;
  for (const model of MODELS) {
    try {
      console.log(`Attempting Gemini API audit with model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error ${response.status}: ${text}`);
      }

      const responseData = await response.json();
      const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error("No response text found in candidate content parts.");
      }

      const parsed: GeminiResponse = JSON.parse(cleanJsonText(textResponse));
      return parsed;
    } catch (err) {
      console.warn(`Model ${model} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to process the request.");
};

const getCarbonRating = (co2e: number) => {
  if (co2e <= 0.2) return { grade: 'A+', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
  if (co2e <= 0.6) return { grade: 'A', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' };
  if (co2e <= 1.5) return { grade: 'B', color: 'text-teal-400 border-teal-500/20 bg-teal-500/5' };
  if (co2e <= 3.5) return { grade: 'C', color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' };
  if (co2e <= 7.0) return { grade: 'D', color: 'text-orange-400 border-orange-500/20 bg-orange-500/5' };
  return { grade: 'F', color: 'text-red-400 border-red-500/20 bg-red-500/5' };
};

export const Scanner: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
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
        triggerAudit(dataUrl);
      }
    }
  };

  // Perform AI Auditing
  const triggerAudit = async (imageSrc: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const auditResult = await auditCarbonFootprint(imageSrc);
      setResult(auditResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process image. Ensure VITE_GEMINI_API_KEY is configured in your .env file.");
    } finally {
      setLoading(false);
    }
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
        const dataUrl = event.target.result as string;
        setCapturedImage(dataUrl);
        stopCamera();
        triggerAudit(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-outfit font-bold text-emerald-400">GreenLens AI Scanner</h1>
          <p className="text-gray-400 mt-2">Scan receipts, barcodes, or food items to audit their carbon footprints instantly.</p>
        </div>

        {/* Main Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Column 1: Input controls */}
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
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Start Camera
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    Capture Frame
                  </button>
                  <button
                    onClick={stopCamera}
                    className="py-3 px-5 bg-red-650 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all border border-red-500/20 cursor-pointer"
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

          {/* Column 2: Status / Loading view */}
          <div className="bg-black/35 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-h-[345px] flex flex-col justify-center">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
                <p className="text-gray-400 text-sm animate-pulse font-outfit">AI is analyzing carbon footprint parameters...</p>
              </div>
            )}

            {error && (
              <div className="text-center text-red-400 p-4 border border-red-500/20 bg-red-500/5 rounded-xl">
                <svg className="mx-auto h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="text-center text-gray-500 py-12">
                <svg className="mx-auto h-12 w-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                </svg>
                <p className="text-sm">Audit results will display here after you snap a photo or upload an image.</p>
              </div>
            )}

            {!loading && result && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-outfit font-bold">Analysis Complete</h3>
                <p className="text-gray-400 text-sm">Detailed audit parameters are loaded below.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sleek full-width Results Card below input grid */}
        {!loading && result && (
          <div className="mt-8 bg-black/45 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 w-full animate-fade-in">
            {/* Header info */}
            <div className="border-b border-white/10 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs text-emerald-400 font-bold tracking-wider uppercase">Active Carbon Audit Report</span>
                  <h3 className="text-3xl font-outfit font-bold text-white mt-1">Footprint Breakdown</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Aggregate Footprint</p>
                    <p className="text-2xl font-bold text-white mt-0.5">{result.total_co2e.toFixed(2)} kg CO2e</p>
                  </div>
                  <div className={`px-4 py-2 border rounded-xl font-outfit font-bold text-2xl ${getCarbonRating(result.total_co2e).color}`}>
                    {getCarbonRating(result.total_co2e).grade}
                  </div>
                </div>
              </div>
            </div>

            {/* List of items */}
            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Audited Items & Suggestions</h4>
              <div className="grid grid-cols-1 gap-6">
                {result.items.map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-lg font-outfit font-bold text-white">{item.name}</h5>
                        <p className="text-xs text-gray-400 mt-0.5">Detected via Vision OCR</p>
                      </div>
                      <span className="text-sm font-bold bg-white/10 border border-white/10 px-3 py-1 rounded-lg">
                        {item.co2e.toFixed(2)} kg CO2e
                      </span>
                    </div>

                    <div className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between transition-all">
                      <div>
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">Sustainable Choice</span>
                        <p className="text-sm font-semibold text-white">{item.alternative}</p>
                      </div>
                      <span className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        Reduce
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
