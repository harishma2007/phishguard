import { getBearerToken, verifyToken } from '../_lib/auth.js';
import { memoryStore } from '../_lib/db.js';

// Suspicious URL Shorteners
const KNOWN_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'is.gd',
  'buff.ly',
  'ow.ly',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'rebrand.ly',
  'v.gd',
  'tiny.cc',
  'bl.ink',
  'qr.ae',
  'adf.ly',
  'bit.do',
]);

// High-abuse TLDs frequently seen in automated phishing kits
const HIGH_RISK_TLDS = new Set([
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'top',
  'buzz',
  'work',
  'click',
  'rest',
  'fit',
  'gdn',
  'country',
  'stream',
]);

// Keywords commonly leveraged in deceptive credential harvesting
const PHISHING_KEYWORDS = [
  'login',
  'signin',
  'verify',
  'verification',
  'authenticate',
  'banking',
  'secure',
  'security',
  'account',
  'update',
  'confirm',
  'password',
  'credential',
  'wallet',
  'paypal',
  'appleid',
  'microsoft',
  'netflix',
  'amazon',
  'recover',
  'billing',
  'support',
  'ebayisapi',
  'webscr',
  'auth',
  'suspended',
  'unusual-activity',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ message: 'URL is required for analysis.' });
    }

    const rawInput = url.trim();

    // Normalize URL for parsing if user omitted protocol
    let urlToParse = rawInput;
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(rawInput);
    if (!hasProtocol) {
      urlToParse = 'http://' + rawInput;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(urlToParse);
    } catch (err) {
      return res.status(400).json({
        message: 'Invalid URL format. Please provide a valid web address.',
      });
    }

    // Check optional authentication for associating history
    let authenticatedUser = null;
    const token = getBearerToken(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        authenticatedUser = decoded;
      }
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();
    const search = parsedUrl.search.toLowerCase();
    const fullUrlLower = rawInput.toLowerCase();

    const checks = [];
    let totalRiskScore = 0;

    // 1. HTTPS Usage Check
    const isHttps = hasProtocol && parsedUrl.protocol === 'https:';
    if (!hasProtocol) {
      checks.push({
        id: 'https_usage',
        name: 'Protocol & Encryption',
        status: 'warning',
        scoreImpact: 15,
        title: 'No Protocol Specified (Insecure by Default)',
        details: 'The URL did not specify HTTPS. Without transport layer security (TLS), communications can be intercepted in transit.',
        recommendation: 'Ensure legitimate sites explicitly use HTTPS to secure sensitive communications.',
      });
      totalRiskScore += 15;
    } else if (parsedUrl.protocol === 'http:') {
      checks.push({
        id: 'https_usage',
        name: 'Protocol & Encryption',
        status: 'warning',
        scoreImpact: 20,
        title: 'Unencrypted HTTP Protocol',
        details: 'The URL explicitly uses unencrypted HTTP. Legitimate banking, authentication, and service platforms always mandate HTTPS.',
        recommendation: 'Do not submit credentials or personal information over plain HTTP connections.',
      });
      totalRiskScore += 20;
    } else if (isHttps) {
      checks.push({
        id: 'https_usage',
        name: 'Protocol & Encryption',
        status: 'pass',
        scoreImpact: 0,
        title: 'HTTPS Encryption Present',
        details: 'The URL uses HTTPS for encrypted communication. Note: While necessary, modern phishing sites also acquire free SSL certificates.',
        recommendation: 'HTTPS protects against eavesdropping but does not solely guarantee a domain is benign.',
      });
    } else {
      checks.push({
        id: 'https_usage',
        name: 'Protocol & Encryption',
        status: 'fail',
        scoreImpact: 25,
        title: `Non-Standard Web Protocol (${parsedUrl.protocol})`,
        details: `The URL uses a non-standard protocol "${parsedUrl.protocol}" which may trigger custom application handlers or file transfers.`,
        recommendation: 'Exercise extreme caution when prompted to open non-HTTP/HTTPS links.',
      });
      totalRiskScore += 25;
    }

    // 2. IP Address Instead of Domain
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^\[?[a-fA-F0-9:]+\]?$/;
    const isIpHost = ipv4Regex.test(hostname) || (hostname.startsWith('[') && ipv6Regex.test(hostname));

    if (isIpHost) {
      checks.push({
        id: 'ip_address_host',
        name: 'Host Identification',
        status: 'fail',
        scoreImpact: 28,
        title: 'Raw IP Address Used Instead of Domain',
        details: `The hostname "${hostname}" is a numerical IP address rather than a registered domain name. Legitimate web services virtually always use branded domain names.`,
        recommendation: 'Phishing campaigns and command-and-control servers often use raw IP addresses to bypass domain reputation checks.',
      });
      totalRiskScore += 28;
    } else {
      checks.push({
        id: 'ip_address_host',
        name: 'Host Identification',
        status: 'pass',
        scoreImpact: 0,
        title: 'Standard Domain Name Format',
        details: `The host uses a standard domain structure ("${hostname}") rather than a direct IP address.`,
        recommendation: 'Always inspect the domain name spelling closely for lookalike variations.',
      });
    }

    // 3. URL Length
    const urlLength = rawInput.length;
    if (urlLength > 75) {
      checks.push({
        id: 'url_length',
        name: 'URL Length',
        status: 'fail',
        scoreImpact: 18,
        title: `Excessive URL Length (${urlLength} characters)`,
        details: 'Phishing URLs frequently use unusually long strings (>75 chars) to hide the real destination, push the domain out of mobile viewports, or pass encoded credential tokens.',
        recommendation: 'Inspect the root domain carefully before clicking extended, convoluted links.',
      });
      totalRiskScore += 18;
    } else if (urlLength > 54) {
      checks.push({
        id: 'url_length',
        name: 'URL Length',
        status: 'warning',
        scoreImpact: 8,
        title: `Moderate URL Length (${urlLength} characters)`,
        details: 'The URL length is moderately long (54–75 chars). While legitimate tracking or redirect parameters can cause this, it warrants inspection.',
        recommendation: 'Check which parameters are being passed in the URL query string.',
      });
      totalRiskScore += 8;
    } else {
      checks.push({
        id: 'url_length',
        name: 'URL Length',
        status: 'pass',
        scoreImpact: 0,
        title: `Normal URL Length (${urlLength} characters)`,
        details: 'The URL length is compact and standard for web navigation (<54 characters).',
        recommendation: 'Compact URLs are easy to read and inspect visually.',
      });
    }

    // 4. Suspicious Symbols
    const symbolFlags = [];
    if ((fullUrlLower.match(/@/g) || []).length > 0) {
      symbolFlags.push('@ symbol in URL path or credentials');
    }
    if ((pathname.match(/\/\//g) || []).length > 0) {
      symbolFlags.push('Consecutive double slashes in URL path (open redirect indicator)');
    }
    const hyphenCount = (hostname.match(/-/g) || []).length;
    if (hyphenCount >= 2) {
      symbolFlags.push(`Multiple hyphens in domain name (${hyphenCount} hyphens)`);
    }
    if (fullUrlLower.includes('%20') || fullUrlLower.includes('%2e') || fullUrlLower.includes('%2f')) {
      symbolFlags.push('URL hex percent-encoding in domain or critical paths');
    }
    if (pathname.includes('~')) {
      symbolFlags.push('Tilde (~) personal server user directory detected');
    }

    if (symbolFlags.length >= 2) {
      checks.push({
        id: 'suspicious_symbols',
        name: 'Suspicious Symbols & Encoding',
        status: 'fail',
        scoreImpact: 20,
        title: 'Multiple Anomalous Symbols Detected',
        details: symbolFlags.join('; '),
        recommendation: 'Attackers use symbol combinations and URL encoding to deceive visual inspection or bypass filtering rules.',
      });
      totalRiskScore += 20;
    } else if (symbolFlags.length === 1) {
      checks.push({
        id: 'suspicious_symbols',
        name: 'Suspicious Symbols & Encoding',
        status: 'warning',
        scoreImpact: 10,
        title: 'Anomalous Symbol Pattern',
        details: symbolFlags[0],
        recommendation: 'Review the flagged symbol to verify whether it matches expected web application routing.',
      });
      totalRiskScore += 10;
    } else {
      checks.push({
        id: 'suspicious_symbols',
        name: 'Suspicious Symbols & Encoding',
        status: 'pass',
        scoreImpact: 0,
        title: 'Clean Symbol Structure',
        details: 'No deceptive double slashes, excessive hyphens, or disguised hex encodings found.',
        recommendation: 'Standard character structures reduce the likelihood of URL deception.',
      });
    }

    // 5. Suspicious Keywords
    const foundKeywords = PHISHING_KEYWORDS.filter((keyword) => {
      const regex = new RegExp(`(^|[-_./?=&])${keyword}([-_./?=&]|$)`, 'i');
      return regex.test(fullUrlLower);
    });

    const isDomainTargeted = foundKeywords.some((k) => hostname.includes(k));

    if (foundKeywords.length >= 2 || (isDomainTargeted && foundKeywords.length >= 1)) {
      checks.push({
        id: 'suspicious_keywords',
        name: 'Security & Brand Keywords',
        status: 'fail',
        scoreImpact: 22,
        title: `Sensitive Keywords Detected (${foundKeywords.slice(0, 4).join(', ')})`,
        details: `The URL contains keywords strongly associated with authentication or account capture: ${foundKeywords.join(', ')}. When paired with third-party domains, this strongly indicates credential theft.`,
        recommendation: 'Never provide login credentials unless you verified the base domain directly through bookmarks or official channels.',
      });
      totalRiskScore += 22;
    } else if (foundKeywords.length === 1) {
      checks.push({
        id: 'suspicious_keywords',
        name: 'Security & Brand Keywords',
        status: 'warning',
        scoreImpact: 10,
        title: `Authentication Keyword Present ("${foundKeywords[0]}")`,
        details: `The URL mentions "${foundKeywords[0]}". Legitimate websites use this for login pages, but attackers also rely on it to fabricate convincing portals.`,
        recommendation: 'Verify that the primary domain belongs to the official organization.',
      });
      totalRiskScore += 10;
    } else {
      checks.push({
        id: 'suspicious_keywords',
        name: 'Security & Brand Keywords',
        status: 'pass',
        scoreImpact: 0,
        title: 'No Sensitive Lure Keywords Flagged',
        details: 'No high-risk credential-harvesting words detected in the domain or path structure.',
        recommendation: 'Attackers frequently use urgency terms like "suspended" or "verify"; none were identified.',
      });
    }

    // 6. Unusual Ports
    const port = parsedUrl.port;
    const isStandardPort = !port || port === '80' || port === '443' || port === '8080';
    if (!isStandardPort) {
      checks.push({
        id: 'unusual_ports',
        name: 'Port Analysis',
        status: 'fail',
        scoreImpact: 18,
        title: `Non-Standard Web Port (Port ${port})`,
        details: `The URL specifies port ${port}. Production web services normally run exclusively on standard HTTP (80) or HTTPS (443) ports.`,
        recommendation: 'Non-standard ports are often used by illicit hosts or testing environments not subjected to enterprise firewalls.',
      });
      totalRiskScore += 18;
    } else {
      checks.push({
        id: 'unusual_ports',
        name: 'Port Analysis',
        status: 'pass',
        scoreImpact: 0,
        title: port ? `Standard Port (${port})` : 'Default Standard Web Port (80/443)',
        details: 'The link operates over conventional HTTP/HTTPS network ports.',
        recommendation: 'Standard ports route through normal browser security controls.',
      });
    }

    // 7. Excessive Subdomains
    const hostParts = hostname.split('.').filter(Boolean);
    // e.g. "www.example.com" has 3 parts -> 1 subdomain level
    const subdomainCount = Math.max(0, hostParts.length - 2);

    if (subdomainCount >= 3) {
      checks.push({
        id: 'excessive_subdomains',
        name: 'Subdomain Hierarchy',
        status: 'fail',
        scoreImpact: 18,
        title: `Excessive Subdomain Stacking (${subdomainCount} subdomains)`,
        details: `The domain "${hostname}" has ${subdomainCount} subdomain layers. Threat actors stack subdomains (e.g. login.paypal.com.attacker-domain.com) to mimic genuine brands.`,
        recommendation: 'Focus on the domain immediately preceding the Top Level Domain (.com, .org, etc.), not the beginning of the string.',
      });
      totalRiskScore += 18;
    } else if (subdomainCount === 2) {
      checks.push({
        id: 'excessive_subdomains',
        name: 'Subdomain Hierarchy',
        status: 'warning',
        scoreImpact: 8,
        title: `Multiple Subdomains (${subdomainCount} subdomains)`,
        details: `Hostname has ${subdomainCount} subdomains. Common in cloud SaaS or multi-tenant architectures, but also utilized in brand spoofing.`,
        recommendation: 'Confirm whether the parent domain aligns with the legitimate organization.',
      });
      totalRiskScore += 8;
    } else {
      checks.push({
        id: 'excessive_subdomains',
        name: 'Subdomain Hierarchy',
        status: 'pass',
        scoreImpact: 0,
        title: 'Standard Domain Hierarchy',
        details: `Domain contains ${subdomainCount} subdomains, which is typical for standard web hosting.`,
        recommendation: 'Clear, shallow domain structures reduce spoofing risks.',
      });
    }

    // 8. Domain Structure & Homographs
    const tld = hostParts.length > 0 ? hostParts[hostParts.length - 1] : '';
    const hasPunycode = hostname.includes('xn--');
    const isHighRiskTld = HIGH_RISK_TLDS.has(tld);
    const hasDoubleExtension = /\.(html|php|asp|jsp|txt)\.(php|exe|scr|bat|sh|zip|apk)$/i.test(pathname);

    if (hasPunycode) {
      checks.push({
        id: 'domain_structure',
        name: 'Domain Structure & Homographs',
        status: 'fail',
        scoreImpact: 25,
        title: 'IDN Homograph (Punycode "xn--") Detected',
        details: `The hostname "${hostname}" uses Internationalized Domain Name (Punycode) encoding. Attackers exploit visually identical Cyrillic or Greek characters to spoof authentic brand names.`,
        recommendation: 'Homograph attacks deceive human visual inspection by replacing characters like Latin "a" with Cyrillic "а".',
      });
      totalRiskScore += 25;
    } else if (isHighRiskTld) {
      checks.push({
        id: 'domain_structure',
        name: 'Domain Structure & Homographs',
        status: 'warning',
        scoreImpact: 14,
        title: `High-Risk / Free TLD (.${tld})`,
        details: `The top-level domain .${tld} is frequently associated with disposable phishing campaigns and zero-cost domain registrations.`,
        recommendation: 'Exercise additional scrutiny when prompted for credentials on unconventional top-level domains.',
      });
      totalRiskScore += 14;
    } else if (hasDoubleExtension) {
      checks.push({
        id: 'domain_structure',
        name: 'Domain Structure & Homographs',
        status: 'fail',
        scoreImpact: 20,
        title: 'Double File Extension in Path',
        details: 'The path contains a double file extension, a technique frequently used to camouflage malware payloads.',
        recommendation: 'Never download or run executable files disguised as document or webpage formats.',
      });
      totalRiskScore += 20;
    } else {
      checks.push({
        id: 'domain_structure',
        name: 'Domain Structure & Homographs',
        status: 'pass',
        scoreImpact: 0,
        title: 'Legitimate Domain Character Structure',
        details: `The domain uses standard ASCII character sets without Punycode disguise or suspicious executable extensions.`,
        recommendation: 'Standard ASCII domain registration is consistent with regular commercial websites.',
      });
    }

    // 9. @ Symbol Check
    const hasAtSymbol = rawInput.includes('@');
    if (hasAtSymbol) {
      checks.push({
        id: 'at_symbol_credential_trick',
        name: 'Credential Redirection (@ Symbol)',
        status: 'fail',
        scoreImpact: 28,
        title: 'Deceptive "@" Symbol in URL',
        details: 'The "@" symbol causes web browsers to discard all characters prior to the "@" as user credentials, silently routing navigation to the domain immediately following it.',
        recommendation: 'Example: "https://google.com@evil-site.com" routes to "evil-site.com", not Google. Do not trust URLs formatted this way.',
      });
      totalRiskScore += 28;
    } else {
      checks.push({
        id: 'at_symbol_credential_trick',
        name: 'Credential Redirection (@ Symbol)',
        status: 'pass',
        scoreImpact: 0,
        title: 'No "@" Redirection Trick',
        details: 'The URL does not use user-info "@" delimiter redirection syntax.',
        recommendation: 'Clean authority structures ensure you navigate to the intended domain.',
      });
    }

    // 10. URL Shortening Patterns
    const isShortener = KNOWN_SHORTENERS.has(hostname) || hostname.endsWith('.link') || hostname.endsWith('.click');
    if (isShortener) {
      checks.push({
        id: 'url_shortening',
        name: 'URL Shortener Cloaking',
        status: 'warning',
        scoreImpact: 16,
        title: `Known URL Shortening Service (${hostname})`,
        details: 'The link utilizes a URL shortening or link redirection service. While widely used for sharing, shorteners obfuscate the real target destination and are heavily leveraged in SMS phishing (smishing).',
        recommendation: 'Use URL expander preview services or inspect unshortened destinations before logging in.',
      });
      totalRiskScore += 16;
    } else {
      checks.push({
        id: 'url_shortening',
        name: 'URL Shortener Cloaking',
        status: 'pass',
        scoreImpact: 0,
        title: 'Direct Destination URL',
        details: 'The link does not utilize a known shortener or redirect cloaking domain.',
        recommendation: 'Direct links allow clear inspection of the landing domain.',
      });
    }

    // Final Risk Score Calculation (clamped to 0–100)
    const riskScore = Math.min(100, Math.max(0, totalRiskScore));

    let status = 'Safe';
    if (riskScore >= 66) {
      status = 'Potentially Phishing';
    } else if (riskScore >= 31) {
      status = 'Suspicious';
    } else {
      status = 'Safe';
    }

    // Save history in memory for logged-in or global recent queries
    const analysisRecord = {
      url: rawInput,
      domain: hostname,
      score: riskScore,
      status,
      timestamp: new Date().toISOString(),
      userId: authenticatedUser ? authenticatedUser.userId : null,
    };
    memoryStore.addHistory(analysisRecord);

    return res.status(200).json({
      success: true,
      url: rawInput,
      parsed: {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80'),
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        subdomainCount,
        isIp: isIpHost,
      },
      score: riskScore,
      status,
      checks,
      summary: {
        totalChecks: checks.length,
        passed: checks.filter((c) => c.status === 'pass').length,
        warnings: checks.filter((c) => c.status === 'warning').length,
        failed: checks.filter((c) => c.status === 'fail').length,
      },
      disclaimer: 'Educational security tool. This rule-based analysis does not guarantee whether a website is safe. Do not enter credentials on unverified websites.',
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('URL analysis error:', error);
    return res.status(500).json({
      message: 'An error occurred while analyzing the URL.',
      error: error.message,
    });
  }
}
