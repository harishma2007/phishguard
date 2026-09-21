import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Radar, 
  Terminal, 
  Lock, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import UrlInputForm from '../components/UrlInputForm.jsx';
import AnalysisResult from '../components/AnalysisResult.jsx';
import RecentScans from '../components/RecentScans.jsx';

export default function Dashboard({
  user,
  analysisResult,
  isAnalyzing,
  onAnalyze,
  recentScans,
  onSelectScan,
  onOpenAuth,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="dashboard-view">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none hidden md:block"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 text-xs font-mono">
            <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Real-Time Rule-Based Phishing Detection</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PhishGuard <span className="text-cyan-400">URL Threat Inspector</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Inspect suspect URLs and domains for multi-vector phishing indicators including HTTPS spoofing, IP hosts, subdomain stacking, deceptive @ credentials, homograph attacks, and cloaking shorteners.
          </p>

          {!user && (
            <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scanning as Guest.</span>
              <button
                onClick={() => onOpenAuth('login')}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
              >
                Sign in
              </button>
              <span>or</span>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
              >
                Register
              </button>
              <span>for session logging.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Scanner Section */}
      <section className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl" id="scanner-section">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>URL Threat Inspection Console</span>
          </h2>
          <p className="text-xs text-slate-400">
            Submit any target URL or domain to evaluate against 10 heuristic cybersecurity rule sets.
          </p>
        </div>

        <UrlInputForm onAnalyze={onAnalyze} isLoading={isAnalyzing} />
      </section>

      {/* Analysis Results View */}
      {analysisResult ? (
        <section id="results-section">
          <AnalysisResult result={analysisResult} />
        </section>
      ) : (
        /* Empty State / Educational Feature Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="educational-feature-grid">
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Rule-Based Heuristics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes HTTPS integrity, raw IP hosting, non-standard web ports, URL length, and suspicious delimiter tricks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Spoofing & Homographs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects Punycode lookalikes (IDN attacks), brand impersonation subdomains, and deceptive executable double extensions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Risk Score 0–100</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant threat stratification categorized into Safe (0–30), Suspicious (31–65), and Potentially Phishing (66–100).
            </p>
          </div>
        </div>
      )}

      {/* Recent Scans Cache */}
      {recentScans && recentScans.length > 0 && (
        <RecentScans scans={recentScans} onSelectScan={onSelectScan} />
      )}

      {/* Educational Heuristics Matrix */}
      <section className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4" id="heuristics-matrix">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">PhishGuard 10-Point Rule Engine Matrix</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">01. HTTPS Protocol</span>
            <p className="text-slate-400 text-[11px]">Validates TLS transport encryption versus plain HTTP.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">02. IP Host Check</span>
            <p className="text-slate-400 text-[11px]">Detects numerical IPv4/IPv6 host addresses bypassing domains.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">03. URL Length</span>
            <p className="text-slate-400 text-[11px]">Flags long links (&gt;75 chars) used to obscure domains on mobile.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">04. Suspicious Symbols</span>
            <p className="text-slate-400 text-[11px]">Inspects for double slashes, multiple hyphens, and percent-encoding.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">05. Brand Keywords</span>
            <p className="text-slate-400 text-[11px]">Searches for credential harvesting terms (login, verify, banking).</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">06. Unusual Ports</span>
            <p className="text-slate-400 text-[11px]">Identifies non-standard ports (e.g. 8080, 8888, 2082) hosted on targets.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">07. Excessive Subdomains</span>
            <p className="text-slate-400 text-[11px]">Flags 3+ subdomains used to mimic brand names.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">08. Homographs & TLDs</span>
            <p className="text-slate-400 text-[11px]">Identifies Punycode (xn--) lookalikes and high-abuse TLDs.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">09. @ Redirection</span>
            <p className="text-slate-400 text-[11px]">Detects browser credential discard syntax (@) masquerading links.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">10. URL Shorteners</span>
            <p className="text-slate-400 text-[11px]">Flags cloaking services (bit.ly, tinyurl) hiding final destination.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
