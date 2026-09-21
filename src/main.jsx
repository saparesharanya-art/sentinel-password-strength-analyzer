import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShieldCheck, Eye, EyeOff, RefreshCw, Copy, Check, LockKeyhole,
  Sparkles, Fingerprint, Database, Gauge, AlertTriangle, CircleCheck
} from "lucide-react";
import "./styles.css";

const COMMON = new Set([
  "password","password1","123456","12345678","123456789","qwerty","qwerty123",
  "admin","welcome","letmein","iloveyou","abc123","monkey","dragon","football",
  "login","passw0rd","india123","admin123","test123","secret"
]);

function getClasses(password) {
  return {
    length: password.length >= 12,
    long: password.length >= 16,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    common: !COMMON.has(password.toLowerCase()),
    repeat: password.length > 0 && !/(.)\1{2,}/.test(password),
    sequence: password.length > 0 && !/(?:123|234|345|456|567|678|789|abc|bcd|cde|qwe|wer|ert)/i.test(password),
  };
}

function analyze(password) {
  if (!password) return { score: 0, label: "Waiting", classes: getClasses(""), entropy: 0 };
  const c = getClasses(password);
  let score = 0;
  score += Math.min(password.length * 3.5, 35);
  score += c.lower ? 10 : 0;
  score += c.upper ? 10 : 0;
  score += c.number ? 10 : 0;
  score += c.symbol ? 15 : 0;
  score += c.long ? 5 : 0;
  score += c.common ? 5 : -25;
  score += c.repeat ? 5 : -10;
  score += c.sequence ? 5 : -10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const charset =
    (c.lower ? 26 : 0) + (c.upper ? 26 : 0) +
    (c.number ? 10 : 0) + (c.symbol ? 33 : 0);
  const entropy = charset ? Math.round(password.length * Math.log2(charset)) : 0;
  const label = score < 30 ? "Very weak" : score < 50 ? "Weak" : score < 70 ? "Fair" : score < 85 ? "Strong" : "Excellent";
  return { score, label, classes: c, entropy };
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function generatePassword(length = 18) {
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%^&*_-+=?";
  const all = lower + upper + numbers + symbols;
  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
  const required = [pick(lower), pick(upper), pick(numbers), pick(symbols)];
  while (required.length < length) required.push(pick(all));
  return required.sort(() => Math.random() - 0.5).join("");
}

function App() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reused, setReused] = useState(false);
  const [checking, setChecking] = useState(false);
  const result = useMemo(() => analyze(password), [password]);

  const criteria = [
    ["12+ characters", result.classes.length],
    ["16+ characters", result.classes.long],
    ["Lowercase letters", result.classes.lower],
    ["Uppercase letters", result.classes.upper],
    ["Numbers", result.classes.number],
    ["Special characters", result.classes.symbol],
    ["Avoid common passwords", result.classes.common],
    ["Avoid repeated characters", result.classes.repeat],
    ["Avoid obvious sequences", result.classes.sequence],
  ];

  const suggestions = [];
  if (!result.classes.length) suggestions.push("Use at least 12 characters.");
  if (!result.classes.long) suggestions.push("Aim for 16+ characters for stronger protection.");
  if (!result.classes.upper) suggestions.push("Add uppercase letters.");
  if (!result.classes.number) suggestions.push("Add a few numbers.");
  if (!result.classes.symbol) suggestions.push("Add special characters such as ! @ # $.");
  if (!result.classes.common) suggestions.push("Avoid common or predictable passwords.");
  if (!result.classes.repeat) suggestions.push("Remove long repeated character patterns.");
  if (!result.classes.sequence) suggestions.push("Avoid easy sequences like 123 or abc.");
  if (!suggestions.length) suggestions.push("Excellent. This password meets all local strength checks.");

  async function checkReuse() {
    if (!password) return;
    setChecking(true);
    const hash = await sha256(password);
    const history = JSON.parse(localStorage.getItem("passwordHashes") || "[]");
    setReused(history.includes(hash));
    if (!history.includes(hash)) {
      localStorage.setItem("passwordHashes", JSON.stringify([...history.slice(-9), hash]));
    }
    setChecking(false);
  }

  async function copyPassword() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function generate() {
    setPassword(generatePassword());
    setReused(false);
  }

  const ring = 2 * Math.PI * 54;
  const offset = ring - (ring * result.score) / 100;

  return (
    <div className="app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={22} /></div>
          <div>
            <strong>SENTINEL</strong>
            <span>SECURITY LABS</span>
          </div>
        </div>
        <div className="privacy-pill"><LockKeyhole size={14}/> Local analysis</div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><Sparkles size={15}/> PASSWORD SECURITY WORKBENCH</div>
          <h1>Build passwords that<br/><span>stand up to attacks.</span></h1>
          <p>Analyze password strength, understand the security signals, and generate a stronger alternative — without sending your password to a server.</p>
        </section>

        <section className="workspace">
          <div className="panel analyzer">
            <div className="panel-head">
              <div>
                <div className="kicker">01 / ANALYZE</div>
                <h2>Password strength</h2>
              </div>
              <Fingerprint size={22} className="muted"/>
            </div>

            <div className="input-wrap">
              <LockKeyhole size={20} />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={e => {setPassword(e.target.value); setReused(false)}}
                placeholder="Enter a password to analyze"
                autoComplete="off"
              />
              <button className="icon-btn" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
                {show ? <EyeOff size={19}/> : <Eye size={19}/>}
              </button>
              {password && <button className="icon-btn" onClick={copyPassword}>{copied ? <Check size={19}/> : <Copy size={19}/>}</button>}
            </div>

            <div className="meter-row">
              <div className="meter">
                <div style={{width: `${result.score}%`}} className={`meter-fill score-${result.score < 30 ? "bad" : result.score < 50 ? "weak" : result.score < 70 ? "fair" : result.score < 85 ? "strong" : "great"}`}/>
              </div>
              <span className="score-label">{result.score}/100</span>
            </div>

            <div className="score-card">
              <div className="score-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" className="ring-bg"/>
                  <circle cx="60" cy="60" r="54" className="ring-progress" strokeDasharray={ring} strokeDashoffset={offset}/>
                </svg>
                <div><b>{result.score}</b><small>/100</small></div>
              </div>
              <div>
                <span className="tiny">CURRENT ASSESSMENT</span>
                <h3>{result.label}</h3>
                <p>Estimated entropy: <b>{result.entropy} bits</b></p>
              </div>
            </div>

            <div className="criteria-grid">
              {criteria.map(([name, ok]) => (
                <div className={`criterion ${ok ? "ok" : ""}`} key={name}>
                  {ok ? <CircleCheck size={17}/> : <span className="empty-dot"/>}
                  <span>{name}</span>
                </div>
              ))}
            </div>

            <div className="action-row">
              <button className="primary" onClick={generate}><RefreshCw size={17}/> Generate strong password</button>
              <button className="secondary" onClick={checkReuse} disabled={!password || checking}>
                <Database size={17}/> {checking ? "Checking..." : "Check reuse"}
              </button>
            </div>

            {reused && <div className="warning"><AlertTriangle size={18}/> This password was previously checked in this browser. Avoid reusing passwords across accounts.</div>}
          </div>

          <aside className="side">
            <div className="panel suggestion-panel">
              <div className="panel-head">
                <div><div className="kicker">02 / IMPROVE</div><h2>Security guidance</h2></div>
                <Gauge size={22} className="muted"/>
              </div>
              <div className="suggestions">
                {suggestions.map((s, i) => <div key={i} className="suggestion"><span>{String(i+1).padStart(2,"0")}</span>{s}</div>)}
              </div>
            </div>

            <div className="panel mini-panel">
              <div className="kicker">03 / PRIVACY</div>
              <h2>Your password stays here.</h2>
              <p>This demo performs analysis in your browser. It does not store the plaintext password or send it to a backend.</p>
              <div className="privacy-line"><ShieldCheck size={18}/> Web Crypto API ready</div>
            </div>
          </aside>
        </section>

        <section className="concepts">
          <div><span>WHY IT MATTERS</span><h2>Security signals, not just a color.</h2></div>
          <div className="concept"><b>Length</b><p>Long passphrases expand the search space an attacker must explore.</p></div>
          <div className="concept"><b>Complexity</b><p>Mixing character classes reduces predictable patterns.</p></div>
          <div className="concept"><b>Uniqueness</b><p>Never reuse a password across important accounts.</p></div>
        </section>
      </main>

      <footer>Sentinel Password Analyzer <span>•</span> Built for TiraneX Skill Development</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
