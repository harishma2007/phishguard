import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AuthPage from './pages/AuthPage.jsx';
import { getMe, analyzeUrl, tokenStorage } from './services/api.js';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'auth'
  const [authMode, setAuthMode] = useState('login');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [globalError, setGlobalError] = useState('');

  // Restore authenticated session on mount using GET /api/auth/me
  useEffect(() => {
    const savedToken = tokenStorage.get();
    if (savedToken) {
      setToken(savedToken);
      getMe(savedToken)
        .then((userData) => {
          if (userData) {
            setUser(userData);
          } else {
            setToken(null);
          }
        })
        .catch(() => {
          setToken(null);
        });
    }
  }, []);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentView('auth');
    setGlobalError('');
  };

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setCurrentView('dashboard');
    setGlobalError('');
  };

  const handleLogout = () => {
    tokenStorage.remove();
    setUser(null);
    setToken(null);
    setCurrentView('dashboard');
  };

  const handleAnalyze = async (url) => {
    setIsAnalyzing(true);
    setGlobalError('');

    try {
      const data = await analyzeUrl(url, token);
      setAnalysisResult(data);

      // Add to session's recent scans list
      setRecentScans((prev) => {
        const item = {
          url: data.url,
          score: data.score,
          status: data.status,
          analyzedAt: data.analyzedAt,
          result: data,
        };
        const filtered = prev.filter((s) => s.url.toLowerCase() !== data.url.toLowerCase());
        return [item, ...filtered].slice(0, 8);
      });
    } catch (err) {
      setGlobalError(err.message || 'Failed to inspect the target URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectRecentScan = (scan) => {
    if (scan.result) {
      setAnalysisResult(scan.result);
    } else {
      handleAnalyze(scan.url);
    }
    // Scroll to results section smoothly
    const resultsElement = document.getElementById('scanner-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d18] text-slate-200 cyber-bg" id="app-root">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
      />

      {/* Global Error Notification */}
      {globalError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full" id="global-error-banner">
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-mono">{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError('')}
              className="text-rose-400 hover:text-rose-200 text-xs font-mono px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'auth' ? (
          <AuthPage
            initialMode={authMode}
            onAuthSuccess={handleAuthSuccess}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : (
          <Dashboard
            user={user}
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyze}
            recentScans={recentScans}
            onSelectScan={handleSelectRecentScan}
            onOpenAuth={handleOpenAuth}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-semibold">PhishGuard</span>
            <span>— Rule-Based Phishing URL Checker</span>
          </div>
          <p className="text-slate-500 text-center sm:text-right">
            Educational security tool. Analysis results do not guarantee absolute safety.
          </p>
        </div>
      </footer>
    </div>
  );
}
