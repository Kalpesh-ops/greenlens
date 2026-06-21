import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0f0d] pt-24 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-outfit font-bold text-emerald-400">Carbon Dashboard</h1>
          <p className="text-gray-400 mt-2">Track habits, manage offsets, and view community leaderboards.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Habits Section */}
          <div className="bg-black/35 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h2 className="text-xl font-outfit font-semibold mb-2">Habits Tracker</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Log daily transits, grocery purchases, and energy usage to calculate daily carbon impact.
              </p>
            </div>
            <button className="mt-6 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold transition-all">
              Manage Habits
            </button>
          </div>

          {/* Offsets Section */}
          <div className="bg-black/35 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h2 className="text-xl font-outfit font-semibold mb-2">Active Offsets</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fund verified agroforestry, renewable energy, and carbon removal projects to neutralize your footprint.
              </p>
            </div>
            <button className="mt-6 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold transition-all">
              Purchase Offsets
            </button>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-black/35 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a4 4 0 0 0-4 4v7h8V6a4 4 0 0 0-4-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-outfit font-semibold mb-2">Leaderboard</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                See how your eco-achievements compare against friends and top contributors in your city.
              </p>
            </div>
            <button className="mt-6 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold transition-all">
              View Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
