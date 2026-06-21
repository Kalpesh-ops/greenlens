import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const SPOTLIGHT_R = 280;

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

const RevealLayer: FC<RevealLayerProps> = ({ image, cursorX, cursorY }) => {
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

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

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

export const HeroSection: FC = () => {
  const navigate = useNavigate();
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

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
    <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: '100dvh' }} aria-label="GreenLens Hero Section">
      {/* Layer 1: Base Image */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat grayscale-[30%] opacity-80 hero-zoom z-10"
        style={{ backgroundImage: "url('/supermarket_base.png')" }}
        role="img"
        aria-label="Bustling supermarket aisle representing modern consumption habits"
      />

      {/* Layer 1.5: Heavy Dark Overlay for Contrast (Legibility Fix) */}
      <div className="absolute inset-0 bg-black/60 z-20 pointer-events-none" aria-hidden="true" />

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
        <button
          onClick={() => navigate('/scanner')}
          aria-label="Launch Carbon Scanner Page"
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
        >
          Launch Scanner
        </button>
      </div>
    </section>
  );
};
