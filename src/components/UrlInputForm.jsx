import React, { useState } from 'react';
import { Search, Globe, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function UrlInputForm({ onAnalyze, isLoading }) {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const sampleUrls = [
    {
      label: 'Safe Target',
      type: 'safe',
      url: 'https://www.wikipedia.org/wiki/Phishing',
      description: 'Standard HTTPS with clean domain hierarchy',
    },
    {
      label: 'Suspicious Subdomains',
      type: 'suspicious',
      url: 'http://login.paypal.com.verify-accounts.top/security/update',
      description: 'Subdomain stacking, high-risk TLD, and unencrypted HTTP',
    },
    {
      label: 'Phishing IP & Credentials',
      type: 'phishing',
      url: 'http://secure-login@192.168.1.105:8080/bank/signin.html.php?verify=true',
      description: 'Raw IP host, @ trick, non-standard port, double extension',
    },
    {
      label: 'Obfuscated Shortener',
      type: 'shortener',
      url: 'https://bit.ly/secure-banking-verification-notice',
      description: 'URL shortener concealing true landing destination',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = inputUrl.trim();

    if (!trimmed) {
      setErrorMsg('Please enter a website URL or domain name to scan.');
      return;
    }

    onAnalyze(trimmed);
  };

  const handleSelectSample = (sampleUrl) => {
    setInputUrl(sampleUrl);
    setErrorMsg('');
    onAnalyze(sampleUrl);
  };

  return (
    <div className="w-full">
      {/* Search Bar Container */}
      <form onSubmit={handleSubmit} className="relative" id="url-scan-form">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950/80 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 text-slate-500 pointer-events-none">
              <Globe className="w-5 h-5 text-cyan-400/80" />
            </div>
            <input
              id="input-url-target"
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter URL to check (e.g., https://example.com or suspicious domain)..."
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none disabled:opacity-60"
              autoComplete="off"
              spellCheck="false"
            />
            {inputUrl && !isLoading && (
              <button
                type="button"
                id="btn-clear-url"
                onClick={() => setInputUrl('')}
                className="mr-2 text-xs font-mono text-slate-500 hover:text-slate-300 px-2 py-1 rounded bg-slate-800/80 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            id="btn-submit-url-check"
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Analyzing URL...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-950" />
                <span>Check URL</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-2 text-xs text-rose-400 font-mono flex items-center space-x-1.5" id="input-error-msg">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Preset Test Case Chips */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Or test with benchmark patterns:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              id={`btn-sample-${sample.type}`}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSample(sample.url)}
              className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all text-left flex items-center space-x-1.5 cursor-pointer ${
                sample.type === 'safe'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40'
                  : sample.type === 'suspicious'
                  ? 'bg-amber-950/30 border-amber-800/50 text-amber-300 hover:bg-amber-900/40'
                  : sample.type === 'phishing'
                  ? 'bg-rose-950/30 border-rose-800/50 text-rose-300 hover:bg-rose-900/40'
                  : 'bg-cyan-950/30 border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/40'
              }`}
              title={sample.description}
            >
              <span>{sample.label}</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
