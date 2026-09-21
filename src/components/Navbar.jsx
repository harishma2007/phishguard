import React from 'react';
import { ShieldCheck, User, LogOut, Lock, ShieldAlert, Cpu } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenAuth, currentView, onViewChange }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onViewChange('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
          id="nav-brand-logo"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-lg shadow-cyan-950/40">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-lg">PhishGuard</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-wide">Rule-Based URL Threat Analyzer</p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 font-mono bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Security Engine Active</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-3" id="nav-user-profile">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200">{user.email}</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-end space-x-1">
                  <Lock className="w-2.5 h-2.5 inline" />
                  <span>Authenticated</span>
                </span>
              </div>
              <button
                id="btn-nav-logout"
                onClick={onLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2" id="nav-auth-buttons">
              <button
                id="btn-nav-login"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                id="btn-nav-register"
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-sm shadow-cyan-900/50 transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
