# PhishGuard – Phishing URL Checker

PhishGuard is a production-ready, rule-based cybersecurity application engineered to evaluate suspect web URLs and domains for multi-vector phishing threats, deceptive structures, and credential harvesting lures.

Built with a modern Vite + React frontend and native Vercel Serverless Functions backend within a unified project architecture.

---

## Features

### 1. 10-Point Heuristic Threat Engine
Evaluates submitted web URLs against 10 critical phishing indicators:
- **HTTPS Usage & Protocol Validation**: Checks for valid TLS encryption versus vulnerable unencrypted plaintext HTTP or non-standard protocol handlers.
- **Raw IP Address Host Detection**: Identifies URLs that use direct numerical IPv4/IPv6 addresses rather than registered domain names.
- **URL Length & Obfuscation**: Flags excessive string lengths (>75 characters) often engineered to displace domains outside mobile browser viewports.
- **Suspicious Symbols & Path Tricks**: Identifies consecutive double slashes (`//`), multiple hyphens in hostnames, tilde directories (`~`), and hex percent-encoding.
- **Sensitive Brand & Lure Keywords**: Detects credential-harvesting triggers (`login`, `signin`, `verify`, `banking`, `security`, `wallet`, `paypal`, `suspended`).
- **Non-Standard Network Ports**: Identifies web targets configured on non-standard ports (such as `8080`, `8888`, `2082`, `7000`) bypassing standard firewall filtering.
- **Excessive Subdomain Stacking**: Flags 3+ subdomain levels leveraged by attackers to spoof authentic brands (e.g., `login.paypal.com.attacker.xyz`).
- **Homograph Attacks & Risky TLDs**: Flags Internationalized Domain Names (IDN Punycode `xn--`) lookalikes, high-abuse TLDs, and executable double extensions (`.html.php`).
- **Credential Redirection (@ Symbol)**: Identifies browser credential-discarding syntax (`https://legit.com@evil-site.com`) routing users to unintended destinations.
- **URL Shortener Cloaking**: Identifies link shortening services (`bit.ly`, `tinyurl.com`, `t.co`, etc.) disguising final landing destinations.

### 2. Threat Stratification & Risk Scoring
- **0–100 Normalized Threat Score**: Granular score calculation combining weighted heuristic impacts.
- **Risk Categorization**:
  - **Safe (0–30)**: Low risk indicator, clean standard domain structure.
  - **Suspicious (31–65)**: Moderate risk; contains obfuscation or redirection patterns.
  - **Potentially Phishing (66–100)**: Critical threat indicators detected (credential lures, IP hosts, or brand spoofing).
- **Parsed URL Architecture Decomposition**: Inspects protocol, hostname, port, pathname, subdomain count, and host classification.

### 3. Authentication & Account Management
- **Registration & Login**: Secure account creation with email format validation and password confirmation.
- **Password Security**: Salted hashing with `bcryptjs`.
- **JWT Authorization**: Cryptographic JSON Web Tokens with 7-day expiration.
- **Client Session Management**: Automatic session verification via `GET /api/auth/me`.
- **Session History**: Fast local cache of scanned targets for instant comparison.

---

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React (Icons), Motion
- **Backend**: Vercel Serverless Functions (`/api/*`)
- **Database**: MongoDB with Mongoose (with in-memory fallback for local preview environments)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Deployment**: Vercel-ready with zero-config serverless function discovery

---

## Project Structure

```
/
├── api/
│   ├── _lib/
│   │   ├── auth.js            # JWT signing, verification & bcrypt utilities
│   │   └── db.js              # MongoDB Mongoose connection & connection cache
│   ├── auth/
│   │   ├── register.js        # POST /api/auth/register
│   │   ├── login.js           # POST /api/auth/login
│   │   └── me.js              # GET /api/auth/me
│   └── url/
│       └── analyze.js         # POST /api/url/analyze (10-point rule engine)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Header navigation, brand & session status
│   │   ├── UrlInputForm.jsx   # Target input form with benchmark test cases
│   │   ├── AnalysisResult.jsx # Score gauge, status cards & heuristics breakdown
│   │   └── RecentScans.jsx    # Session scan history widget
│   ├── pages/
│   │   ├── Dashboard.jsx      # Cybersecurity command center
│   │   └── AuthPage.jsx       # Login & Registration views
│   ├── services/
│   │   └── api.js             # API service using relative paths
│   ├── App.jsx                # Main application component & routing
│   ├── main.jsx               # React entry point
│   └── App.css                # Cybersecurity theme styling & animations
├── package.json
├── vite.config.js             # Vite configuration with local serverless dev middleware
├── vercel.json                # Vercel deployment and routing rules
├── .env.example               # Environment variables template
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env.local` or set these in your Vercel project dashboard:

```env
# MongoDB Connection URI (e.g. from MongoDB Atlas)
MONGODB_URI=your_mongodb_connection_string

# Secret key used for signing JWT authentication tokens
JWT_SECRET=your_jwt_secret
```

> **Note**: If `MONGODB_URI` is not set during initial local development, PhishGuard automatically switches to in-memory mode so you can test registration, login, and URL scanning immediately.

---

## Local Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd phishguard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB URI and JWT Secret
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`. Both the frontend and the `/api/*` Vercel Serverless Function routes run concurrently through Vite's built-in serverless middleware!

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## MongoDB Setup Instructions

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free shared cluster (M0).
2. Under **Database Access**, create a database user with read and write privileges.
3. Under **Network Access**, add an IP Access List entry (allow `0.0.0.0/0` for Vercel serverless functions).
4. Click **Connect** > **Drivers** > **Node.js** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/phishguard?retryWrites=true&w=majority
   ```
5. Set this connection string as the `MONGODB_URI` environment variable.

---

## Vercel Deployment Instructions

1. Push your repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Vercel automatically detects Vite as the framework.
4. Add the Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for signing JWTs.
5. Click **Deploy**.
   - The frontend is served statically from `dist/`.
   - The backend routes under `/api/` are automatically provisioned as individual Vercel Serverless Functions.

---

## Security & Educational Disclaimer

> **IMPORTANT DISCLAIMER**:  
> PhishGuard is a rule-based educational cybersecurity tool. The analysis results, heuristics, and risk scores generated by this software **do not guarantee** whether a website or domain is safe or dangerous. Threat actors continuously evolve evasion techniques.
>
> This application does **not** engage in active exploitation, vulnerability exploitation, unauthorized port scanning, brute-forcing, credential harvesting, or any unauthorized network activity. Always exercise caution and never enter credentials or banking details on unverified websites.
