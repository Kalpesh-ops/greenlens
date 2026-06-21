import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import { HeroSection } from './components/HeroSection';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Google Sign-In failed:", error);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation (Fixed, over hero) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent" aria-label="Global Navigation">
        {/* Left Logo + Wordmark */}
        <Link to="/" className="flex items-center cursor-pointer z-50" aria-label="GreenLens Home Page">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="14" cy="14" r="9" stroke="#10b981" strokeWidth="2.5" />
            <line x1="20.5" y1="20.5" x2="28" y2="28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M14 8C14 8 18 11 18 14C18 17 15 19 14 19C13 19 10 17 10 14C10 11 14 8 14 8Z" fill="#10b981" />
          </svg>
          <span className="text-white text-2xl font-outfit font-bold tracking-tight ml-2">GreenLens</span>
        </Link>

        {/* Center Pill */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-1.5 py-1.5 items-center gap-1 z-50" role="group" aria-label="Navigation Actions">
          <NavLink
            to="/scanner"
            aria-label="Navigate to Carbon Scanner"
            className={({ isActive }) =>
              `px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/15 hover:text-white'
              }`
            }
          >
            Audit
          </NavLink>
          {['Habits', 'Offsets', 'Leaderboard'].map((item) => (
            <NavLink
              key={item}
              to="/dashboard"
              aria-label={`Navigate to Carbon Dashboard ${item} Section`}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive || (location.pathname === '/dashboard' && isActive) ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/15 hover:text-white'
                }`
              }
            >
              {item}
            </NavLink>
          ))}
        </div>

        {/* Right (Desktop) */}
        <div className="hidden md:block z-50">
          {authLoading ? (
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" role="status" aria-label="Loading authentication state"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full py-1.5 pl-2.5 pr-4" aria-label="Authenticated user profile info">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User avatar"} className="w-7 h-7 rounded-full object-cover border border-emerald-500" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-450 flex items-center justify-center font-bold text-xs" aria-hidden="true">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white text-xs font-medium max-w-[120px] truncate">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                aria-label="Sign Out of your account"
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              aria-label="Connect your Google Account"
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-[1.02] cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Connect Account
            </button>
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="md:hidden z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="text-white hover:text-emerald-400 focus:outline-none transition-colors p-2 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <div className="fixed inset-0 z-[90] bg-[#0a0f0d]/95 backdrop-blur-xl flex flex-col justify-center items-center gap-8 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Navigate to Home Page"
            className="text-white/80 hover:text-emerald-400 text-2xl font-outfit font-semibold transition-all"
          >
            Home
          </Link>
          <Link
            to="/scanner"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Navigate to Carbon Scanner Page"
            className="text-white/80 hover:text-emerald-400 text-2xl font-outfit font-semibold transition-all"
          >
            Audit
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Navigate to Dashboard Page"
            className="text-white/80 hover:text-emerald-400 text-2xl font-outfit font-semibold transition-all"
          >
            Dashboard
          </Link>
          {user ? (
            <div className="flex flex-col items-center gap-4 mt-4">
              <span className="text-gray-400 text-sm" aria-label="User Email">{user.email}</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                aria-label="Sign Out of your account"
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-lg font-semibold px-8 py-3 rounded-full transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogin();
              }}
              aria-label="Connect your Google Account"
              className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-semibold px-8 py-3.5 rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Connect Account
            </button>
          )}
        </div>
      )}

      {/* Routes configuration */}
      <main id="main-content" aria-label="Main Content Area">
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
