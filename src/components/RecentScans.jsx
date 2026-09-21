import React from 'react';
import { History, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RecentScans({ scans = [], onSelectScan }) {
  if (!scans || scans.length === 0) return null;

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl" id="recent-scans-widget">
      <div className="flex items-center justify-between mb-3.5">
        <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center space-x-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Recent URL Scans ({scans.length})</span>
        </h4>
        <span className="text-[10px] font-mono text-slate-500">Session Cache</span>
      </div>

      <div className="space-y-2">
        {scans.slice(0, 5).map((scan, idx) => {
          const isSafe = scan.status === 'Safe';
          const isSuspicious = scan.status === 'Suspicious';

          return (
            <div
              key={idx}
              id={`recent-scan-item-${idx}`}
              onClick={() => onSelectScan(scan)}
              className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {isSafe ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isSuspicious ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="text-xs font-mono text-slate-300 truncate group-hover:text-cyan-300 transition-colors">
                  {scan.url}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSafe
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                      : isSuspicious
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                  }`}
                >
                  Score {scan.score}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
