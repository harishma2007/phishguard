import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Network
} from 'lucide-react';

export default function AnalysisResult({ result }) {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'flagged' | 'passed'
  const [expandedCheck, setExpandedCheck] = useState(null);

  if (!result) return null;

  const {
    url,
    score,
    status,
    checks = [],
    parsed = {},
    summary = {},
    disclaimer,
    analyzedAt,
  } = result;

  const handleCopy = () => {
    const textReport = `PhishGuard URL Security Report
Target: ${url}
Score: ${score}/100
Status: ${status}
Analyzed: ${new Date(analyzedAt).toLocaleString()}
Checks: ${summary.passed} Passed, ${summary.warnings} Warnings, ${summary.failed} Failed
`;
    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color scheme based on status
  const isSafe = status === 'Safe';
  const isSuspicious = status === 'Suspicious';
  const isPhishing = status === 'Potentially Phishing';

  const statusConfig = {
    Safe: {
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      borderClass: 'border-emerald-500/30 shadow-emerald-950/40',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      headline: 'Low Threat Probability',
      description: 'The URL passed typical heuristics. No overt phishing indicators detected.',
    },
    Suspicious: {
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      borderClass: 'border-amber-500/30 shadow-amber-950/40',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      headline: 'Moderate Risk Indicators',
      description: 'The URL exhibits patterns commonly used in deceptive links or link cloaking.',
    },
    'Potentially Phishing': {
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      borderClass: 'border-rose-500/30 shadow-rose-950/40',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      headline: 'High Phishing Probability',
      description: 'Critical phishing indicators identified (such as credential harvesting, spoofing, or abnormal host structures).',
    },
  }[status] || {
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    borderClass: 'border-slate-800',
    icon: Info,
    iconColor: 'text-slate-400',
    headline: 'Analyzed',
    description: 'URL analysis completed.',
  };

  const StatusIcon = statusConfig.icon;

  const filteredChecks = checks.filter((c) => {
    if (filter === 'flagged') return c.status === 'fail' || c.status === 'warning';
    if (filter === 'passed') return c.status === 'pass';
    return true;
  });

  return (
    <div className="space-y-6" id="analysis-result-container">
      {/* Primary Status Card */}
      <div 
        className={`p-6 bg-slate-900/90 border rounded-2xl shadow-xl transition-all ${statusConfig.borderClass}`}
        id="card-status-primary"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Status & Headline */}
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-xl border ${statusConfig.badgeClass}`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`text-xs uppercase font-mono tracking-wider font-bold px-2.5 py-1 rounded-full border ${statusConfig.badgeClass}`}>
                  {status}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(analyzedAt).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1.5">{statusConfig.headline}</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">{statusConfig.description}</p>
            </div>
          </div>

          {/* Risk Score Gauge */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    isSafe
                      ? 'text-emerald-500'
                      : isSuspicious
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                  strokeDasharray={`${score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-white">{score}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Risk</span>
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="text-slate-400">Threat Scale: <span className="text-slate-200">0 - 100</span></div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">0-30: Safe</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-400">31-65: Suspicious</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="text-slate-400">66-100: Phishing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analyzed Target URL Display */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-lg">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Target Scanned</span>
            <p className="text-sm font-mono text-cyan-300 truncate select-all">{url}</p>
          </div>
          <button
            id="btn-copy-report"
            onClick={handleCopy}
            className="self-start sm:self-center inline-flex items-center space-x-1.5 text-xs font-mono px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* URL Architecture Decomposition */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl" id="card-url-breakdown">
        <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <span>Parsed URL Architecture</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase">Protocol</span>
            <span className={parsed.protocol === 'https:' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {parsed.protocol || 'None'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 col-span-2">
            <span className="text-slate-500 block text-[10px] uppercase">Hostname</span>
            <span className="text-slate-200 truncate block">{parsed.hostname || 'None'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase">Port</span>
            <span className="text-slate-300">{parsed.port || 'Standard'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase">Subdomains</span>
            <span className={parsed.subdomainCount >= 3 ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
              {parsed.subdomainCount ?? 0}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase">Host Type</span>
            <span className={parsed.isIp ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
              {parsed.isIp ? 'Raw IP' : 'Domain'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Checks List Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Security Rule Heuristics ({checks.length} checks performed)</span>
            </h4>
            <p className="text-xs text-slate-400">
              Breakdown of individual phishing rules and heuristic risk weights
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({checks.length})
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'flagged' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flagged ({summary.warnings + summary.failed})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'passed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Passed ({summary.passed})
            </button>
          </div>
        </div>

        {/* Individual Security Check Cards */}
        <div className="space-y-3" id="security-checks-list">
          {filteredChecks.map((check) => {
            const isCheckPass = check.status === 'pass';
            const isCheckWarn = check.status === 'warning';
            const isCheckFail = check.status === 'fail';
            const isExpanded = expandedCheck === check.id;

            return (
              <div
                key={check.id}
                id={`check-card-${check.id}`}
                className={`border rounded-xl transition-all ${
                  isCheckPass
                    ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                    : isCheckWarn
                    ? 'bg-amber-950/10 border-amber-800/40 hover:border-amber-700/60'
                    : 'bg-rose-950/15 border-rose-800/50 hover:border-rose-700/70'
                }`}
              >
                <div
                  onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="shrink-0">
                      {isCheckPass && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {isCheckWarn && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                      {isCheckFail && <XCircle className="w-5 h-5 text-rose-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-slate-400">{check.name}</span>
                        {check.scoreImpact > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                            +{check.scoreImpact} Risk
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-medium text-slate-100 truncate mt-0.5">
                        {check.title}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span
                      className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded ${
                        isCheckPass
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          : isCheckWarn
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {check.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details & Recommendation */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-2 text-xs">
                    <div className="text-slate-300">
                      <span className="font-semibold text-slate-400">Analysis: </span>
                      {check.details}
                    </div>
                    {check.recommendation && (
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-200/90 font-mono">
                        <span className="font-bold text-cyan-400">Security Tip: </span>
                        {check.recommendation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Educational Disclaimer */}
      <div 
        className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 space-y-1.5"
        id="card-security-disclaimer"
      >
        <div className="flex items-center space-x-2 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Educational Security Tool Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          {disclaimer} PhishGuard is a heuristic, rule-based educational platform designed to analyze common deceptive patterns in URL structures. This tool does not guarantee whether a website is completely safe, nor does it conduct active network penetration, credential harvesting, or exploitation. Never submit passwords or banking credentials on unverified websites.
        </p>
      </div>
    </div>
  );
}
