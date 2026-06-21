import React, { useState, useEffect, useRef } from 'react';

const SPOTLIGHT_R = 280;

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

const RevealLayer: React.FC<RevealLayerProps> = ({ image, cursorX, cursorY }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealDivRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Only draw gradient if mouse has entered the window (i.e. is not the initial -999)
    if (cursorX !== -999 && cursorY !== -999) {
      const grad = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
      grad.addColorStop(0.75, 'rgba(255,255,255,0.3)');
      grad.addColorStop(0.9, 'rgba(255,255,255,0.1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();
    }

    try {
      const dataUrl = canvas.toDataURL();
      const revealDiv = revealDivRef.current;
      if (revealDiv) {
        revealDiv.style.maskImage = `url(${dataUrl})`;
        revealDiv.style.webkitMaskImage = `url(${dataUrl})`;
        revealDiv.style.maskSize = '100% 100%';
        revealDiv.style.webkitMaskSize = '100% 100%';
        revealDiv.style.maskRepeat = 'no-repeat';
        revealDiv.style.webkitMaskRepeat = 'no-repeat';
      }
    } catch (e) {
      console.error("Mask rendering failed:", e);
    }
  }, [cursorX, cursorY, dimensions]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none z-30"
        style={{ display: 'none' }}
      />
      <div
        ref={revealDivRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
    </>
  );
};

function App() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const tick = () => {
      if (mouse.current.x !== -999 && mouse.current.y !== -999) {
        if (smooth.current.x === -999) {
          smooth.current.x = mouse.current.x;
          smooth.current.y = mouse.current.y;
        } else {
          smooth.current.x += (mouse.current.x - smooth.current.x) * 0.12;
          smooth.current.y += (mouse.current.y - smooth.current.y) * 0.12;
        }
        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f0d] tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation (Fixed, over hero) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
        {/* Left Logo + Wordmark */}
        <div className="flex items-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="9" stroke="#10b981" strokeWidth="2.5" />
            <line x1="20.5" y1="20.5" x2="28" y2="28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M14 8C14 8 18 11 18 14C18 17 15 19 14 19C13 19 10 17 10 14C10 11 14 8 14 8Z" fill="#10b981" />
          </svg>
          <span className="text-white text-2xl font-outfit font-bold tracking-tight ml-2">GreenLens</span>
        </div>

        {/* Center Pill */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-1.5 py-1.5 items-center gap-1">
          {['Audit', 'Habits', 'Offsets', 'Leaderboard'].map((item) => (
            <button
              key={item}
              className="text-white/70 hover:bg-white/15 hover:text-white transition-all px-5 py-2 rounded-full text-sm font-medium"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right (Desktop) */}
        <div className="hidden md:block">
          <button className="bg-white/10 border border-white/20 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white hover:text-black transition-colors">
            Connect Account
          </button>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-emerald-400 focus:outline-none transition-colors p-2"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-90 bg-[#0a0f0d]/95 backdrop-blur-xl flex flex-col justify-center items-center gap-8 md:hidden">
          {['Audit', 'Habits', 'Offsets', 'Leaderboard'].map((item) => (
            <button
              key={item}
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/80 hover:text-emerald-400 text-2xl font-outfit font-semibold transition-all"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-semibold px-8 py-3.5 rounded-full transition-all"
          >
            Connect Account
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: '100dvh' }}>
        {/* Layer 1: Base Image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat grayscale-[30%] opacity-80 hero-zoom z-10"
          style={{ backgroundImage: "url('/supermarket_base.png')" }}
        />

        {/* Layer 2: Reveal layer */}
        <RevealLayer
          image="/supermarket_carbon_overlay.png"
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
        />

        {/* Layer 3: Heading */}
        <div className="absolute top-[18%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[1.05]">
            <span
              className="block font-outfit text-5xl sm:text-7xl md:text-8xl text-emerald-400 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.04em', animationDelay: '0.2s' }}
            >
              Reveal the hidden
            </span>
            <span
              className="block font-outfit text-5xl sm:text-7xl md:text-8xl mt-2 text-white hero-anim hero-reveal"
              style={{ letterSpacing: '-0.04em', animationDelay: '0.35s' }}
            >
              cost of consumption.
            </span>
          </h1>
        </div>

        {/* Layer 4: Bottom-left Paragraph */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[300px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.6s' }}
        >
          <p className="text-sm text-emerald-50/80 leading-relaxed backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/10">
            Every purchase leaves a trace. Our AI analyzes your receipts, transit routes, and daily habits to calculate the exact carbon weight of your lifestyle.
          </p>
        </div>

        {/* Layer 5: Bottom-right block */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.75s' }}
        >
          <p className="text-xs sm:text-sm text-emerald-50/80 leading-relaxed backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/10">
            Peel back the surface of everyday items. Discover sustainable alternatives and offset your footprint with a single snap.
          </p>
          <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            Launch Scanner
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
